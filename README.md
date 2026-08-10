<div align="center">
  <img src="frontend/public/logo_v4.png" alt="Aura Knowledge Engine Logo" width="200" />

  # Aura Knowledge Engine
  
  **An autonomous AI agent that builds interactive Knowledge Graphs from unstructured text.**

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![CockroachDB](https://img.shields.io/badge/CockroachDB-Serverless-6933FF?logo=cockroachlabs)](https://www.cockroachlabs.com/)
  [![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazonaws)](https://aws.amazon.com/)
  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)

</div>

---

## 🌟 Overview
Aura Knowledge Engine is a full-stack, distributed cloud application that transforms raw, unstructured text into visually interactive 3D Knowledge Graphs. By leveraging state-of-the-art Large Language Models (LLMs), Aura dynamically extracts entities and relationships, storing them securely in a highly available CockroachDB Serverless cluster.

This project demonstrates a robust modern Cloud Computing Architecture, seamlessly distributing workloads across Edge Networks (Vercel) and Cloud Virtual Machines (AWS EC2).

## 🚀 Key Features
- **AI-Powered Graph Extraction**: Powered by `llama-3.1-8b-instant` via LangChain to extract entities (Nodes) and relationships (Edges) with high precision.
- **CockroachDB Persistent Storage**: Utilizing CockroachDB's distributed SQL for ultra-low latency reads/writes, ensuring data integrity and horizontal scalability.
- **Vector Embeddings (pgvector)**: Storing semantic vector embeddings for nodes in CockroachDB to enable advanced AI-driven similarity search.
- **AWS EC2 Deployment**: The Python/FastAPI backend is securely deployed on an Amazon Web Services (AWS) EC2 instance, utilizing REST APIs to serve graph data.
- **Interactive 3D Visualization**: A highly responsive Next.js frontend featuring `react-force-graph-3d` for dynamic, physics-based graph rendering in the browser.

## 🏗️ Architecture & File Structure

```text
aura-knowledge-engine/
├── backend/                       # Python FastAPI Server (Hosted on AWS EC2)
│   ├── agent.py                   # LangChain/LangGraph AI extraction logic
│   ├── database.py                # CockroachDB SQLAlchemy connection setup
│   ├── models.py                  # Database schema (Nodes, Edges, pgvector)
│   ├── main.py                    # FastAPI application routes
│   └── requirements.txt           # Python dependencies
├── frontend/                      # Next.js React UI (Hosted on Vercel)
│   ├── public/                    # Assets and Logos
│   ├── src/app/
│   │   ├── api/                   # Next.js Serverless Proxy Routes
│   │   ├── components/
│   │   │   └── Graph.tsx          # 3D Force Graph Component
│   │   ├── page.tsx               # Main Dashboard UI
│   │   └── globals.css            # Tailwind & Custom CSS
│   ├── package.json               # Node.js dependencies
│   └── tailwind.config.ts         # Tailwind CSS configuration
├── .gitignore
└── README.md                      # Project Documentation
```

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- CockroachDB Serverless URL (`DATABASE_URL`)
- Groq API Key (`GROQ_API_KEY`)

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
Create a `.env` file in the `backend/` directory with your database and API keys.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to view the application. The frontend automatically proxies requests to the backend server.

## ☁️ Cloud Deployment
1. **Frontend**: The React UI is optimized for Edge deployment and is continuously deployed via **Vercel**. It uses Serverless API routes to proxy requests, securely avoiding Mixed Content errors.
2. **Backend**: Hosted on an **AWS EC2 Ubuntu Instance**. The FastAPI server runs continuously in the background, with port 8000 exposed via AWS Security Groups.
3. **Database**: Hosted on **CockroachDB Serverless** using robust PostgreSQL bindings.

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
### 👨‍💻 Credits
Architected and Developed by **Abhijeet Kangane (@Abhi666-max)**.
