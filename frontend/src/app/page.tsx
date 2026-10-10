"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BrainCircuit, Database, Server, Cpu,
  Globe, Waypoints, ArrowRight, ArrowUpRight,
  MessageSquare, Cog, GitBranch, Boxes, Zap, Network
} from "lucide-react";

/* ─── Ticker text ─────────────────────────────────────────── */
const TICKER_TEXT = "AURA KNOWLEDGE ENGINE ● EXTRACT ● CONNECT ● VISUALIZE ● LLAMA 3.1 ● COCKROACHDB ● LANGGRAPH ● FASTAPI ● NEXT.JS ● ";

/* ─── Mechanical snap-in ──────────────────────────────────── */
const snapIn = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "linear" } },
};
const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

export default function LandingPage() {
  return (
    <div className="swiss-body min-h-screen text-[#0A0A0A] overflow-x-hidden relative">

      {/* ── Grid overlay ─────────────────────────────────── */}
      <div className="swiss-grid-overlay" />
      {/* ── Red sweep on load ────────────────────────────── */}
      <div className="red-sweep" />

      {/* ── NAVBAR ───────────────────────────────────────── */}
      <header className="swiss-nav">
        <div className="max-w-[1400px] mx-auto px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-2 border-[#0A0A0A] flex items-center justify-center">
              <Image src="/logo_swiss.jpg" alt="Aura" width={18} height={18} />
            </div>
            <div className="flex items-center gap-3">
              <span className="display-heading text-2xl text-[#0A0A0A]">AURA</span>
              <span className="swiss-label mt-1">Knowledge Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden sm:flex items-center gap-2 swiss-label">
              <span className="w-2 h-2 bg-[#FF0000]" />
              LIVE
            </span>
            <a
              href="https://github.com/Abhi666-max/aura-knowledge-engine"
              target="_blank" rel="noreferrer"
              className="hidden sm:block swiss-label hover:text-[#FF0000] transition-colors cursor-pointer"
            >
              GITHUB <ArrowUpRight className="inline w-3 h-3" />
            </a>
            <Link href="/engine" className="swiss-btn-primary flex items-center gap-2 text-sm px-6 py-2.5">
              LAUNCH <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── RED TICKER BAR ───────────────────────────────── */}
      <div className="ticker-bar fixed top-[67px] left-0 right-0 z-40 py-1.5">
        <div className="ticker-inner">
          {[0, 1].map((i) => (
            <span key={i} className="text-white text-[10px] font-bold tracking-[0.35em] px-2">
              {TICKER_TEXT}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-8 pt-28 pb-20 max-w-[1400px] mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>

          <motion.div variants={snapIn} className="flex items-center gap-4 mb-8">
            <hr className="swiss-rule-red w-12" />
            <span className="swiss-label">Autonomous AI Knowledge Extraction</span>
          </motion.div>

          <motion.h1 variants={snapIn} className="display-heading text-[clamp(4rem,13vw,12rem)] text-[#0A0A0A] leading-[0.88] mb-10">
            TURN<br />
            TEXT INTO<br />
            <span className="text-[#FF0000]">INTELLIGENCE.</span>
          </motion.h1>

          <motion.div variants={snapIn} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl">
            <div>
              <hr className="swiss-rule-thin mb-4" />
              <p className="text-[15px] text-[#444] leading-[1.7]">
                AURA is an autonomous AI agent that reads any unstructured text and
                extracts entities, relationships, and semantic connections — building
                a persistent knowledge graph in real time.
              </p>
            </div>
            <div>
              <hr className="swiss-rule-thin mb-4" />
              <p className="text-[15px] text-[#444] leading-[1.7]">
                Powered by Llama 3.1 via LangGraph, stored in CockroachDB with pgvector,
                and rendered as an interactive physics-driven 3D force graph directly
                in the browser.
              </p>
            </div>
          </motion.div>

          <motion.div variants={snapIn} className="flex flex-col sm:flex-row items-start gap-4">
            <Link href="/engine" className="swiss-btn-primary flex items-center gap-3 text-base px-10 py-4">
              <Waypoints className="w-5 h-5" />
              START EXTRACTING
            </Link>
            <a
              href="https://github.com/Abhi666-max/aura-knowledge-engine"
              target="_blank" rel="noreferrer"
              className="swiss-btn-secondary flex items-center gap-3 text-sm px-8 py-4"
            >
              VIEW SOURCE CODE
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div variants={snapIn} className="flex items-center gap-12 mt-16">
            {[
              { num: "01", label: "LLM MODEL", val: "LLAMA 3.1" },
              { num: "02", label: "DATABASE", val: "COCKROACHDB" },
              { num: "03", label: "BACKEND", val: "FASTAPI" },
              { num: "04", label: "DEPLOY", val: "AWS EC2" },
            ].map((s) => (
              <div key={s.num} className="hidden sm:block">
                <p className="text-[9px] font-mono text-[#ccc] tracking-[0.3em] mb-1">{s.num}/</p>
                <p className="swiss-label mb-0.5">{s.label}</p>
                <p className="text-sm font-bold text-[#0A0A0A] tracking-wide">{s.val}</p>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </section>

      <div className="max-w-[1400px] mx-auto px-8"><hr className="swiss-rule" /></div>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — 3 Steps
          ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-8 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.3 }}
          className="flex items-start justify-between mb-20"
        >
          <div>
            <span className="swiss-label block mb-3">The Process</span>
            <h2 className="display-heading text-[clamp(2.5rem,7vw,5rem)] text-[#0A0A0A] leading-[0.9]">
              HOW AURA<br />WORKS<span className="text-[#FF0000]">.</span>
            </h2>
          </div>
          <span className="display-heading text-[clamp(3rem,8vw,6rem)] text-[rgba(0,0,0,0.05)] hidden md:block">001</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {[
            {
              step: "01", title: "INPUT",
              icon: <MessageSquare className="w-6 h-6" />,
              desc: "You paste any unstructured text into the chat — an article, raw notes, a Wikipedia paragraph, or any concept you want to map. AURA's minimal interface accepts raw human language with no formatting requirements.",
            },
            {
              step: "02", title: "EXTRACT",
              icon: <BrainCircuit className="w-6 h-6" />,
              desc: "AURA's LangGraph-based agentic pipeline sends your text to Llama 3.1 (hosted on Groq). The LLM autonomously identifies named entities (people, concepts, technologies, events) and the relationships between them. No manual tagging or schema definition is needed.",
            },
            {
              step: "03", title: "RENDER",
              icon: <Waypoints className="w-6 h-6" />,
              desc: "Extracted nodes and edges are persisted into CockroachDB (a globally distributed SQL database). The frontend then fetches this graph data and renders it as an interactive, physics-driven 3D force-directed graph using react-force-graph-3d — right in your browser.",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="swiss-card p-8 relative"
            >
              <span className="bg-number">{card.step}</span>
              <div className="relative z-10">
                <div className="w-12 h-12 border-2 border-[#0A0A0A] flex items-center justify-center mb-6">
                  {card.icon}
                </div>
                <p className="swiss-label mb-2">Step {card.step}</p>
                <h3 className="display-heading text-4xl text-[#0A0A0A] mb-4">{card.title}</h3>
                <p className="text-[14px] text-[#555] leading-[1.7]">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-8"><hr className="swiss-rule" /></div>

      {/* ══════════════════════════════════════════════════════
          REQUEST FLOW — Full Mechanism
          ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-8 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.3 }}
          className="flex items-start justify-between mb-20"
        >
          <div>
            <span className="swiss-label block mb-3">Request Lifecycle</span>
            <h2 className="display-heading text-[clamp(2.5rem,7vw,5rem)] text-[#0A0A0A] leading-[0.9]">
              THE<br />MECHANISM<span className="text-[#FF0000]">.</span>
            </h2>
          </div>
          <span className="display-heading text-[clamp(3rem,8vw,6rem)] text-[rgba(0,0,0,0.05)] hidden md:block">002</span>
        </motion.div>

        {/* Flow steps */}
        <div className="space-y-0">
          {[
            {
              num: "01",
              title: "USER INPUT → NEXT.JS FRONTEND",
              icon: <Globe className="w-6 h-6" />,
              desc: "The user types unstructured text into the chat interface built with Next.js 15 (App Router). On submit, the frontend sends a POST request to /api/chat — a Next.js API route that acts as a proxy.",
              detail: "POST /api/chat → { text: \"Albert Einstein developed the theory of relativity...\" }",
            },
            {
              num: "02",
              title: "NEXT.JS PROXY → FASTAPI BACKEND",
              icon: <Server className="w-6 h-6" />,
              desc: "The Next.js API route forwards the request to the FastAPI backend server hosted on AWS EC2. This proxy layer exists to avoid exposing the backend IP directly to the browser and to handle CORS.",
              detail: "Next.js (Vercel) → HTTP POST → FastAPI (EC2: http://<ip>:8000/chat)",
            },
            {
              num: "03",
              title: "FASTAPI → LANGGRAPH AGENT",
              icon: <Cog className="w-6 h-6" />,
              desc: "FastAPI receives the text and passes it to a LangGraph-based agentic pipeline. LangGraph orchestrates the workflow — it manages state, decides which tools to call, and handles retries. The agent has access to tools for entity extraction and database writes.",
              detail: "agent.invoke({ input: userText }) → LangGraph state machine runs",
            },
            {
              num: "04",
              title: "LANGGRAPH → LLAMA 3.1 (GROQ)",
              icon: <Cpu className="w-6 h-6" />,
              desc: "The LangGraph agent sends the user's text to Llama 3.1-70B hosted on Groq's ultra-fast inference API. The LLM is prompted to extract structured data: a list of entities (nodes) with types and a list of relationships (edges) with labels connecting them.",
              detail: "Groq API → Llama 3.1-70B → Returns JSON: { nodes: [...], edges: [...] }",
            },
            {
              num: "05",
              title: "EXTRACTED DATA → COCKROACHDB",
              icon: <Database className="w-6 h-6" />,
              desc: "The extracted nodes and edges are written into CockroachDB — a distributed, cloud-native SQL database. Nodes are stored in a 'nodes' table with ID, label, and group fields. Edges are stored in an 'edges' table with source, target, and label. Duplicate detection prevents redundant entries.",
              detail: "INSERT INTO nodes (id, label, group) ... INSERT INTO edges (source, target, label) ...",
            },
            {
              num: "06",
              title: "RESPONSE → FRONTEND → 3D GRAPH",
              icon: <Network className="w-6 h-6" />,
              desc: "FastAPI returns the agent's natural language response along with counts of extracted entities and relationships. The frontend then fetches the full graph via GET /api/graph, which queries CockroachDB for all nodes and edges. This data is fed into react-force-graph-3d, which renders a live, interactive, physics-simulated 3D knowledge graph.",
              detail: "GET /api/graph → { nodes: [...], links: [...] } → Three.js 3D Render",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="swiss-card p-8 flex flex-col md:flex-row gap-8 relative"
            >
              <span className="bg-number">{step.num}</span>
              <div className="relative z-10 flex-shrink-0 flex items-start gap-6">
                <div className="w-14 h-14 border-2 border-[#0A0A0A] flex items-center justify-center flex-shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <p className="swiss-label mb-2">Step {step.num}</p>
                  <h3 className="display-heading text-2xl md:text-3xl text-[#0A0A0A] mb-3">{step.title}</h3>
                  <p className="text-[14px] text-[#555] leading-[1.7] mb-4 max-w-2xl">{step.desc}</p>
                  <div className="bg-[#F7F7F5] border-2 border-[#E0E0E0] px-4 py-2.5 inline-block">
                    <code className="text-[11px] text-[#FF0000] font-mono tracking-wide">{step.detail}</code>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-8"><hr className="swiss-rule" /></div>

      {/* ══════════════════════════════════════════════════════
          TECH STACK — How it was built
          ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-8 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.3 }}
          className="flex items-start justify-between mb-20"
        >
          <div>
            <span className="swiss-label block mb-3">Technology Stack</span>
            <h2 className="display-heading text-[clamp(2.5rem,7vw,5rem)] text-[#0A0A0A] leading-[0.9]">
              HOW IT WAS<br />BUILT<span className="text-[#FF0000]">.</span>
            </h2>
          </div>
          <span className="display-heading text-[clamp(3rem,8vw,6rem)] text-[rgba(0,0,0,0.05)] hidden md:block">003</span>
        </motion.div>

        {/* Table-style grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-[#0A0A0A]">
          {[
            { icon: <Globe className="w-6 h-6" />,    num: "01", title: "NEXT.JS 15",    role: "Frontend",  deploy: "Vercel Edge", details: "App Router, Tailwind v4, react-force-graph-3d" },
            { icon: <Server className="w-6 h-6" />,   num: "02", title: "FASTAPI",       role: "Backend",   deploy: "AWS EC2",    details: "Python async, LangGraph orchestration, REST APIs" },
            { icon: <Cpu className="w-6 h-6" />,      num: "03", title: "LLAMA 3.1",     role: "LLM Brain", deploy: "Groq API",  details: "70B model, structured entity extraction" },
            { icon: <Database className="w-6 h-6" />, num: "04", title: "COCKROACHDB",   role: "Database",  deploy: "Cloud SQL",   details: "Distributed SQL, stores nodes/edges, pgvector" },
            { icon: <Network className="w-6 h-6" />,  num: "05", title: "LANGGRAPH",     role: "Agent",     deploy: "Framework", details: "State machine for autonomous workflows" },
            { icon: <Zap className="w-6 h-6" />,      num: "06", title: "GROQ API",      role: "Inference", deploy: "LPU",       details: "Ultra-fast low latency LLM inference" },
            { icon: <Cog className="w-6 h-6" />,      num: "07", title: "FRAMER MOTION", role: "Animation", deploy: "Library",   details: "Declarative brutalist UI animations" },
            { icon: <Boxes className="w-6 h-6" />,    num: "08", title: "THREE.JS",      role: "3D Engine", deploy: "WebGL",     details: "Hardware-accelerated graph rendering" },
          ].map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.1, delay: i * 0.03 }}
              className="swiss-cell p-6 flex flex-col gap-4 border-r border-b border-[#0A0A0A] h-full"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#bbb]">/{node.num}</span>
                {node.icon}
              </div>
              <div>
                <h4 className="display-heading text-2xl text-[#0A0A0A] mb-1">{node.title}</h4>
                <p className="swiss-label">{node.role}</p>
              </div>
              <p className="text-[12px] text-[#777] leading-[1.6] flex-grow">{node.details}</p>
              <p className="text-[10px] text-[#bbb] font-mono tracking-wider">{node.deploy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-8"><hr className="swiss-rule" /></div>

      {/* ══════════════════════════════════════════════════════
          KEY FEATURES
          ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-32 px-8 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.3 }}
          className="flex items-start justify-between mb-20"
        >
          <div>
            <span className="swiss-label block mb-3">Capabilities</span>
            <h2 className="display-heading text-[clamp(2.5rem,7vw,5rem)] text-[#0A0A0A] leading-[0.9]">
              KEY<br />FEATURES<span className="text-[#FF0000]">.</span>
            </h2>
          </div>
          <span className="display-heading text-[clamp(3rem,8vw,6rem)] text-[rgba(0,0,0,0.05)] hidden md:block">004</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {[
            { icon: <BrainCircuit className="w-5 h-5" />, title: "AUTONOMOUS EXTRACTION", desc: "No manual tagging required. The AI agent autonomously decides what entities to extract and how they relate to each other." },
            { icon: <Boxes className="w-5 h-5" />, title: "3D KNOWLEDGE GRAPH", desc: "Interactive, physics-driven 3D force-directed graph rendered in the browser. Zoom, pan, rotate — explore your knowledge visually." },
            { icon: <Database className="w-5 h-5" />, title: "PERSISTENT STORAGE", desc: "All extracted knowledge is permanently stored in CockroachDB. Your graph survives page refreshes and server restarts." },
            { icon: <Zap className="w-5 h-5" />, title: "REAL-TIME UPDATES", desc: "Graph updates live after every extraction. New nodes and edges appear instantly without requiring a page reload." },
            { icon: <GitBranch className="w-5 h-5" />, title: "INCREMENTAL BUILDING", desc: "Each new input adds to the existing graph. Over time, your knowledge graph grows richer and more interconnected." },
            { icon: <Network className="w-5 h-5" />, title: "ENTITY MANAGEMENT", desc: "View, search, and delete individual nodes and edges. Full CRUD operations on your knowledge graph through the Database Context panel." },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="swiss-card p-8 flex items-start gap-5"
            >
              <div className="w-10 h-10 border-2 border-[#0A0A0A] flex items-center justify-center flex-shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="display-heading text-xl text-[#0A0A0A] mb-2">{feat.title}</h3>
                <p className="text-[13px] text-[#555] leading-[1.7]">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-8"><hr className="swiss-rule" /></div>

      {/* ══════════════════════════════════════════════════════
          CTA
          ══════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-40 px-8 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl"
        >
          <hr className="swiss-rule-red w-20 mb-10" />
          <h2 className="display-heading text-[clamp(3rem,9vw,8rem)] text-[#0A0A0A] leading-[0.88] mb-8">
            YOUR GRAPH<br />
            STARTS WITH<br />
            <span className="text-[#FF0000]">ONE SENTENCE.</span>
          </h2>
          <p className="text-[16px] text-[#555] max-w-xl leading-[1.7] mb-12">
            No setup. No configuration. No schema definition.
            Type one sentence and watch AURA construct a living knowledge network.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link href="/engine" className="swiss-btn-primary flex items-center gap-3 text-lg px-12 py-5">
              <Waypoints className="w-6 h-6" />
              OPEN AURA ENGINE
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t-3 border-[#0A0A0A] bg-white">
        <div className="max-w-[1400px] mx-auto px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-[#0A0A0A] flex items-center justify-center">
              <Image src="/logo_swiss.jpg" alt="Aura" width={12} height={12} />
            </div>
            <span className="swiss-label">Aura Knowledge Engine · 2026</span>
          </div>
          <p className="text-xs text-[#999]">
            <a href="https://github.com/Abhi666-max/aura-knowledge-engine" target="_blank" rel="noreferrer" className="text-[#FF0000] hover:underline font-semibold">
              View on GitHub
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
}
