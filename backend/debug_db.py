import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import insert
import os
from dotenv import load_dotenv
from models import Node, Edge, Base

load_dotenv()

DATABASE_URL = os.getenv("COCKROACH_DB_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "cockroachdb+asyncpg://", 1)
if DATABASE_URL and "sslmode=verify-full" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("sslmode=verify-full", "ssl=require")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def run_test():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        new_nodes = [{"id": "Apple", "label": "Apple Inc", "group": "2"}]
        new_edges = [{"source": "Apple", "target": "Steve Jobs", "label": "founded by"}]
        
        node_dict = {}
        for n in new_nodes:
            norm_id = n["id"].lower().replace(" ", "_")
            n["id"] = norm_id
            node_dict[norm_id] = n
            
        referenced_node_ids = set()
        for e in new_edges:
            e["source"] = e["source"].lower().replace(" ", "_")
            e["target"] = e["target"].lower().replace(" ", "_")
            referenced_node_ids.add(e["source"])
            referenced_node_ids.add(e["target"])
            
        all_node_ids = set(node_dict.keys()).union(referenced_node_ids)
        print("ALL NODE IDS:", all_node_ids)
        
        for nid in all_node_ids:
            if nid in node_dict:
                n_data = node_dict[nid]
                label = n_data.get("label", nid)
                group = 1
            else:
                label = nid.replace("_", " ").title()
                group = 1
                
            stmt = insert(Node).values(id=nid, label=label, group=group)
            stmt = stmt.on_conflict_do_update(
                index_elements=['id'],
                set_=dict(label=stmt.excluded.label, group=stmt.excluded.group)
            )
            print(f"Executing insert for {nid}")
            await db.execute(stmt)
            
        await db.flush()
        
        for e in new_edges:
            print(f"Adding edge: {e['source']} -> {e['target']}")
            db.add(Edge(source=e["source"], target=e["target"], label=e.get("label", "")))
            
        try:
            print("Committing...")
            await db.commit()
            print("SUCCESS")
        except Exception as e:
            print("ERROR!!!", e)
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(run_test())
