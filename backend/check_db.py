import asyncio
from sqlalchemy.future import select
from database import engine
from models import Node, Edge

from sqlalchemy import text

async def check():
    async with engine.begin() as conn:
        nodes = await conn.execute(text("SELECT id FROM nodes"))
        edges = await conn.execute(text("SELECT source, target FROM edges"))
        
        node_ids = {row[0] for row in nodes.fetchall()}
        edge_objs = edges.fetchall()
        
        orphan_edges = []
        for e in edge_objs:
            if e[0] not in node_ids or e[1] not in node_ids:
                orphan_edges.append(e)
                
        print(f"Total Nodes: {len(node_ids)}")
        print(f"Total Edges: {len(edge_objs)}")
        print(f"Orphan Edges: {len(orphan_edges)}")
        if len(orphan_edges) > 0:
            print("FAILED! Found orphans:", orphan_edges)
        else:
            print("SUCCESS! No orphan edges.")

if __name__ == "__main__":
    asyncio.run(check())
