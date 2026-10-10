from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from dotenv import load_dotenv

load_dotenv()

from agent import app as agent_app
from database import Base, engine, get_db
from models import Edge, Node
import hashlib

app = FastAPI(title="Aura Knowledge Engine API", version="1.0.0")

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to Aura Knowledge Engine API. The intelligence engine is running.",
        "frontend_url": "https://aura-knowledge-engine.vercel.app",
        "api_documentation": "/docs"
    }

# Vector DB embedding mock generator (to save EC2 disk space)
def generate_mock_embedding(text: str, dim: int = 384):
    h = hashlib.sha256(text.encode()).digest()
    return [(float(b) / 255.0) for b in h] + [0.5] * (dim - 32)

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
        from sqlalchemy import text
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        # Idempotent table creation (preserves existing valid data)
        await conn.run_sync(Base.metadata.create_all)


class ChatRequest(BaseModel):
    text: str


@app.post("/api/chat")
async def process_chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    # Fetch existing graph context for the LLM (Optimized memory limit)
    nodes_result = await db.execute(select(Node))
    # Limit to latest 50 edges to prevent exceeding LLM context window
    edges_result = await db.execute(select(Edge).order_by(Edge.id.desc()).limit(50))
    existing_nodes = {n.id: n.label for n in nodes_result.scalars().all()}
    existing_edges = edges_result.scalars().all()
    
    context_lines = []
    for e in reversed(existing_edges):  # Reverse to keep chronological order in context
        source_label = existing_nodes.get(e.source, e.source)
        target_label = existing_nodes.get(e.target, e.target)
        context_lines.append(f"{source_label} --({e.label})--> {target_label}")
    
    graph_context = "\n".join(context_lines) if context_lines else "No previous context."

    # Run the agent synchronously for immediate UI feedback in demo
    inputs = {"input_text": request.text, "graph_context": graph_context}
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

            # Generate vector embedding for semantic search
            try:
                emb = generate_mock_embedding(label)
            except Exception:
                emb = None

            # db.merge guarantees the object is added to the session safely and upserted
            await db.merge(Node(id=nid, label=label, group=group, embedding=emb))

        # Flush nodes to the database so they are available for Edge foreign key checks
        await db.flush()

        # Add edges without duplicating
        existing_edge_tuples = {(e.source, e.target, e.label) for e in existing_edges}
        for e in new_edges:
            edge_tuple = (e["source"], e["target"], e.get("label", ""))
            if edge_tuple not in existing_edge_tuples:
                db.add(Edge(source=e["source"], target=e["target"], label=e.get("label", "")))
                existing_edge_tuples.add(edge_tuple)

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


@app.delete("/api/node/{node_id}")
async def delete_node(node_id: str, db: AsyncSession = Depends(get_db)):
    try:
        from sqlalchemy import text
        # Delete edges connected to this node first (foreign keys or logical connections)
        await db.execute(text("DELETE FROM edges WHERE source = :id OR target = :id"), {"id": node_id})
        # Delete the node itself
        await db.execute(text("DELETE FROM nodes WHERE id = :id"), {"id": node_id})
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "success", "message": f"Node {node_id} deleted"}

@app.post("/api/reset")
async def reset_graph(db: AsyncSession = Depends(get_db)):
    try:
        from sqlalchemy import text

        # Use DELETE instead of TRUNCATE for instant execution on Serverless CockroachDB
        await db.execute(text("DELETE FROM edges"))
        await db.execute(text("DELETE FROM nodes"))
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "reset"}
