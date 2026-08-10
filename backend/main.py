from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from agent import app as agent_app
from database import Base, engine, get_db
from models import Edge, Node

app = FastAPI(title="Nexus Knowledge Graph API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Idempotent table creation (preserves existing valid data)
        await conn.run_sync(Base.metadata.create_all)


class ChatRequest(BaseModel):
    text: str


@app.post("/api/chat")
async def process_chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    # Run the agent synchronously for immediate UI feedback in demo
    inputs = {"input_text": request.text}
    final_state = agent_app.invoke(inputs)

    new_nodes = final_state.get("nodes", [])
    new_edges = final_state.get("edges", [])

    # Save to CockroachDB
    try:
        # Build a dictionary of nodes explicitly provided by the LLM
        # Normalize IDs to lowercase and replace spaces with underscores for safety
        node_dict = {}
        for n in new_nodes:
            norm_id = n["id"].lower().replace(" ", "_")
            n["id"] = norm_id
            node_dict[norm_id] = n

        # Collect all node IDs implicitly referenced in edges
        referenced_node_ids = set()
        for e in new_edges:
            e["source"] = e["source"].lower().replace(" ", "_")
            e["target"] = e["target"].lower().replace(" ", "_")
            referenced_node_ids.add(e["source"])
            referenced_node_ids.add(e["target"])

        # Combine all node IDs and strip whitespace just to be extremely safe
        all_node_ids = {
            nid.strip() for nid in set(node_dict.keys()).union(referenced_node_ids) if nid.strip()
        }

        # Ensure all required nodes exist in the database robustly using ORM Merge
        # This completely eliminates Core vs ORM transaction state desyncs
        for nid in all_node_ids:
            if nid in node_dict:
                n_data = node_dict[nid]
                label = n_data.get("label", nid)
                try:
                    group = int(n_data.get("group", 1))
                except ValueError:
                    group = 1
            else:
                label = nid.replace("_", " ").title()
                group = 1

            # db.merge guarantees the object is added to the session safely and upserted
            await db.merge(Node(id=nid, label=label, group=group))

        # Flush nodes to the database so they are available for Edge foreign key checks
        await db.flush()

        # Add edges
        for e in new_edges:
            db.add(Edge(source=e["source"], target=e["target"], label=e.get("label", "")))

        await db.commit()
    except Exception as e:
        await db.rollback()
        import traceback

        traceback.print_exc()
        print("DB Error:", e)
        raise HTTPException(status_code=500, detail=f"Database transaction failed: {str(e)}")

    return {
        "status": "success",
        "extracted_nodes": len(new_nodes),
        "extracted_edges": len(new_edges),
        "agent_response": final_state.get("response", "Processing complete."),
    }


@app.get("/api/graph")
async def get_graph(db: AsyncSession = Depends(get_db)):
    nodes_result = await db.execute(select(Node))
    edges_result = await db.execute(select(Edge))

    nodes = [{"id": n.id, "label": n.label, "group": n.group} for n in nodes_result.scalars().all()]
    edges = [
        {"source": e.source, "target": e.target, "label": e.label}
        for e in edges_result.scalars().all()
    ]

    return {"nodes": nodes, "links": edges}


@app.post("/api/reset")
async def reset_graph(db: AsyncSession = Depends(get_db)):
    try:
        from sqlalchemy import text

        # Truncate edges first, then nodes to wipe data instantly without slow row-by-row deletion
        await db.execute(text("TRUNCATE TABLE edges, nodes CASCADE;"))
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "reset"}
