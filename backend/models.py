from sqlalchemy import Column, String, Text, ForeignKey, Integer, DateTime
from pgvector.sqlalchemy import Vector
from database import Base


class Node(Base):
    __tablename__ = "nodes"

    id = Column(String(100), primary_key=True, index=True)
    label = Column(String(255), nullable=False)
    group = Column(Integer, default=1)
    embedding = Column(Vector(384), nullable=True)


class Edge(Base):
    __tablename__ = "edges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source = Column(String(100), ForeignKey("nodes.id"), nullable=False)
    target = Column(String(100), ForeignKey("nodes.id"), nullable=False)
    label = Column(String(255), nullable=True)


class NodeBackup(Base):
    __tablename__ = "nodes_backup"

    id = Column(String(100), primary_key=True, index=True)
    label = Column(String(255), nullable=False)
    group = Column(Integer, default=1)
    embedding = Column(Vector(384), nullable=True)


class EdgeBackup(Base):
    __tablename__ = "edges_backup"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source = Column(String(100), nullable=False)
    target = Column(String(100), nullable=False)
    label = Column(String(255), nullable=True)
