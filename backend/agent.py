import os
from dotenv import load_dotenv
load_dotenv()
from typing import List, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field


class AgentState(TypedDict):
    input_text: str
    graph_context: str
    nodes: list
    edges: list
    response: str


llm = ChatGroq(
    temperature=0, model_name="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY")
)


class NodeModel(BaseModel):
    id: str = Field(
        description="Unique identifier for the entity, lowercase with underscores"
    )
    label: str = Field(description="Display name of the entity")
    group: str = Field(
        description="1 for People, 2 for Companies, 3 for Concepts. (Output as a string digit)"
    )


class EdgeModel(BaseModel):
    source: str = Field(description="ID of the source node")
    target: str = Field(description="ID of the target node")
    label: str = Field(
        description="Relationship describing how source connects to target"
    )


class GraphExtraction(BaseModel):
    nodes: List[NodeModel] = Field(default_factory=list)
    edges: List[EdgeModel] = Field(default_factory=list)
    response: str = Field(
        description="A natural, conversational response answering the user's query."
    )


def extract_knowledge(state: AgentState):
    """Extracts entities and relationships from the text."""
    input_text = state["input_text"]
    graph_context = state.get("graph_context", "")

    prompt = SystemMessage(
        content=f"""You are Aura, an advanced AI Assistant and Knowledge Graph Extractor.
First, answer the user's question fully and conversationally in the "response" field. 
Use the provided Knowledge Graph Context below if relevant to answer the user's question.

CRITICAL INSTRUCTION FOR CONTEXT:
The Knowledge Graph Context contains facts extracted from previous interactions. Assume that any nodes representing a person interacting with the system (like "Abhi", "user") refer to the current user you are talking to.
If the context says "Abhi --(presenting)--> Project", and the user asks "who am I?", you MUST confidently infer the user is Abhi and answer accordingly.

Knowledge Graph Context (Previously extracted facts):
{graph_context}

Then, extract the relevant entities ("nodes") and their relationships ("edges") from the user's NEW input.
Make IDs lowercase with underscores.
Do not extract relationships unless both source and target entities are clearly identifiable.

CRITICAL INSTRUCTION FOR EXTRACTION:
- Do NOT generalize terms. If the user says "Cloud Computing mini project", extract exactly "Cloud Computing mini project", DO NOT simplify it to "Project".
- Keep proper nouns, technical terms, and specific names exactly as the user typed them.

You MUST return exactly ONE JSON object with three keys: "response", "nodes", and "edges".
"nodes" must be an array of objects with keys: "id", "label", "group".
"edges" must be an array of objects with keys: "source", "target", "label".
Output ONLY valid JSON. No markdown formatting, no code blocks."""
    )

    # Use native structured output instead of JSON mode
    structured_llm = llm.with_structured_output(GraphExtraction)

    try:
        parsed = structured_llm.invoke([prompt, HumanMessage(content=input_text)])
        
        return {
            "nodes": [n.dict() for n in parsed.nodes],
            "edges": [e.dict() for e in parsed.edges],
            "response": parsed.response,
        }
    except Exception as e:
        print("Failed to parse AI output:", e)
        return {
            "nodes": [],
            "edges": [],
            "response": f"Error extracting graph data: {str(e)}",
        }


graph = StateGraph(AgentState)
graph.add_node("extract", extract_knowledge)
graph.set_entry_point("extract")
graph.add_edge("extract", END)

app = graph.compile()
