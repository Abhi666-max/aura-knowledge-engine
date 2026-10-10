"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Send, Cpu, Database, Server, X, Search, Trash2, RefreshCw, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Graph from "../components/Graph";

type Message = {
  role: "user" | "agent" | "system";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", content: "AURA KNOWLEDGE ENGINE INITIALIZED.\n\nInput a topic, article, or unstructured text. The system will autonomously extract entities and relationships into CockroachDB." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch("/api/graph");
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
      }
    } catch {
      console.error("Failed to fetch graph");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGraph();
  }, [fetchGraph]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "agent", content: `${data.agent_response}\n\n[SYSTEM: Extracted ${data.extracted_nodes} entities and ${data.extracted_edges} relationships to CockroachDB]` }]);
        fetchGraph();
      } else {
        const errorData = await res.json();
        setMessages(prev => [...prev, { role: "agent", content: `ERROR: ${errorData.detail || 'Backend process failed.'}` }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "agent", content: "CRITICAL ERROR: Could not connect to backend. Ensure the server is running." }]);
    }
    
    setIsLoading(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        setGraphData({ nodes: [], links: [] });
        setMessages([{ role: "agent", content: "MEMORY WIPED. AURA is ready to build a new knowledge graph." }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "agent", content: "ERROR: Failed to reset memory. Server might be restarting." }]);
    }
    setIsResetting(false);
    setIsWipeModalOpen(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#F7F7F5] text-[#0A0A0A]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      
      {/* ── Left Panel: Chat ─────────────────────────────── */}
      <div className="w-full md:w-[500px] lg:w-[600px] xl:w-[650px] shrink-0 h-full bg-[#FFFFFF] flex flex-col border-r-[3px] border-[#0A0A0A] z-10 relative">
        
        {/* Header */}
        <div className="px-8 py-5 flex items-center justify-between border-b-3 border-[#0A0A0A]">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-9 h-9 border-2 border-[#ddd] flex items-center justify-center text-[#999] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors" title="Back to Home">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 border-2 border-[#0A0A0A] flex items-center justify-center">
              <Image src="/logo_swiss.jpg" alt="Aura" width={22} height={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-[0.08em] text-[#0A0A0A]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>AURA ENGINE</h1>
              <p className="text-[9px] text-[#999] font-mono tracking-[0.3em] uppercase">Knowledge Graph Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="hidden sm:flex items-center gap-2 text-[9px] font-mono tracking-[0.3em] text-[#999] mr-3">
              <span className="w-2 h-2 bg-[#FF0000]" />
              LIVE
            </span>
            <button
              onClick={() => { fetchGraph(); setMessages(prev => [...prev, { role: "system", content: "SYSTEM: Graph synced with database." }]); }}
              className="w-9 h-9 border-2 border-[#ddd] flex items-center justify-center text-[#999] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors"
              title="Refresh Graph"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsWipeModalOpen(true)}
              disabled={isResetting}
              className="w-9 h-9 border-2 border-[#ddd] flex items-center justify-center text-[#999] hover:text-[#FF0000] hover:border-[#FF0000] transition-colors disabled:opacity-50"
              title="Wipe Database"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 saas-scroll bg-[#FAFAF8]">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: "linear" }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] px-4 py-3 text-[13px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#0A0A0A] text-[#F7F7F5] font-medium border-2 border-[#0A0A0A]' 
                    : msg.role === 'system' 
                    ? 'bg-[#FF0000]/5 text-[#CC0000] border-2 border-[#FF0000]/20'
                    : 'bg-[#FFFFFF] text-[#333] border-2 border-[#E0E0E0]'
                }`}>
                  <div className="whitespace-pre-wrap" style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>{msg.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="max-w-[85%] px-4 py-3 text-[12px] bg-[#FFFFFF] text-[#999] border-2 border-[#E0E0E0] flex items-center gap-3" style={{ fontFamily: "'DM Mono', monospace" }}>
                <Cpu className="w-3.5 h-3.5 animate-spin text-[#FF0000]" /> PROCESSING KNOWLEDGE...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-8 pb-8 pt-4 bg-[#FFFFFF] border-t-2 border-[#E0E0E0]">
          <form onSubmit={handleSubmit} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="INPUT UNSTRUCTURED TEXT..." 
              className="w-full bg-[#F7F7F5] border-2 border-[#ddd] py-3.5 pl-4 pr-14 text-[13px] text-[#0A0A0A] placeholder-[#bbb] focus:outline-none focus:border-[#FF0000] transition-colors tracking-wide"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-0 top-0 bottom-0 w-12 bg-[#FF0000] text-white flex items-center justify-center hover:bg-[#cc0000] transition-colors disabled:bg-[#eee] disabled:text-[#ccc] disabled:cursor-not-allowed border-l-2 border-[#ddd]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          <div className="mt-5 flex items-center justify-between text-[9px] font-mono text-[#999] tracking-[0.3em] uppercase">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3" /> COCKROACHDB
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#FF0000]" />
              AURA v1.0
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: 3D Graph ────────────────────────── */}
      <div className="flex-1 h-full relative bg-[#F7F7F5] overflow-hidden">
        <Graph data={graphData} />
        
        {/* Wipe Modal */}
        <AnimatePresence>
          {isWipeModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-white/70 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#FFFFFF] border-2 border-[#0A0A0A] p-8 shadow-[6px_6px_0_#0A0A0A] max-w-sm w-full mx-4"
              >
                <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2 tracking-[0.08em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>WIPE DATABASE?</h2>
                <p className="text-sm text-[#777] mb-6" style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
                  This will permanently delete the entire knowledge graph. This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsWipeModalOpen(false)}
                    className="px-5 py-2.5 border-2 border-[#ddd] text-sm font-medium text-[#777] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors tracking-wider uppercase"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className="px-5 py-2.5 border-2 border-[#FF0000] text-sm font-medium bg-[#FF0000] text-white hover:bg-[#cc0000] transition-colors tracking-wider uppercase shadow-[4px_4px_0_#0A0A0A]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {isResetting ? "WIPING..." : "YES, WIPE IT"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Delete Node Modal */}
        <AnimatePresence>
          {nodeToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-white/70 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#FFFFFF] border-2 border-[#0A0A0A] p-8 shadow-[6px_6px_0_#0A0A0A] max-w-sm w-full mx-4"
              >
                <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2 tracking-[0.08em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>DELETE NODE?</h2>
                <p className="text-sm text-[#777] mb-6" style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>
                  Permanently delete node <span className="text-[#FF0000] font-bold">&apos;{nodeToDelete}&apos;</span>? This cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setNodeToDelete(null)}
                    className="px-5 py-2.5 border-2 border-[#ddd] text-sm font-medium text-[#777] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors tracking-wider uppercase"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const id = nodeToDelete;
                      setNodeToDelete(null);
                      await fetch('/api/delete-node', { method: 'POST', body: JSON.stringify({id}) });
                      fetchGraph();
                    }}
                    className="px-5 py-2.5 border-2 border-[#FF0000] text-sm font-medium bg-[#FF0000] text-white hover:bg-[#cc0000] transition-colors tracking-wider uppercase shadow-[4px_4px_0_#0A0A0A]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    YES, DELETE
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Graph Stats Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-6 right-8 flex items-center gap-3"
        >
          <div className="bg-[#FFFFFF] border-2 border-[#0A0A0A] px-5 py-2.5 text-xs font-mono text-[#666] flex items-center gap-6 tracking-wider shadow-[3px_3px_0_#0A0A0A]">
             <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#0A0A0A]"></div> NODES: {graphData.nodes.length}</span>
             <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#FF0000]"></div> EDGES: {graphData.links.length}</span>
          </div>
          <button onClick={() => setIsContextOpen(true)} className="bg-[#FFFFFF] border-2 border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white text-[#0A0A0A] px-4 py-2.5 flex items-center gap-2 text-xs font-bold transition-colors tracking-[0.15em] uppercase shadow-[3px_3px_0_#FF0000]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Server className="w-3.5 h-3.5" /> DB CONTEXT
          </button>
        </motion.div>

        {/* Database Context Sliding Panel */}
        <AnimatePresence>
          {isContextOpen && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "tween", duration: 0.2, ease: "linear" }}
              className="absolute top-0 right-0 h-full w-[400px] bg-[#FFFFFF] border-l-[3px] border-[#0A0A0A] shadow-2xl flex flex-col z-50"
            >
              <div className="px-6 py-5 border-b-2 border-[#0A0A0A] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0A0A0A] font-bold text-lg tracking-[0.08em]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  <Database className="w-4 h-4 text-[#FF0000]" /> DATABASE CONTEXT
                </div>
                <button onClick={() => setIsContextOpen(false)} className="w-8 h-8 border-2 border-[#ddd] flex items-center justify-center text-[#999] hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8 saas-scroll bg-[#FAFAF8]">
                
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-[#bbb] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="SEARCH NODES OR EDGES..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#F7F7F5] border-2 border-[#ddd] pl-10 pr-4 py-2.5 text-sm text-[#0A0A0A] placeholder-[#bbb] focus:outline-none focus:border-[#FF0000] transition-colors tracking-wide"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  />
                </div>

                <div>
                  <h3 className="text-[10px] font-mono font-bold text-[#999] uppercase tracking-[0.35em] mb-4 px-1">/ EXTRACTED NODES</h3>
                  <div className="space-y-2">
                    {graphData.nodes.filter((n: Record<string, unknown>) => String(n.id).includes(searchQuery.toLowerCase()) || (typeof n.label === "string" && n.label.toLowerCase().includes(searchQuery.toLowerCase()))).map((n: Record<string, unknown>, i) => {
                      const node = n as { id: string, group?: string, label?: string };
                      return (
                        <div key={i} className="p-3.5 bg-[#FFFFFF] border-2 border-[#E0E0E0] flex flex-col gap-2 hover:border-[#0A0A0A] hover:shadow-[3px_3px_0_#0A0A0A] hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-[#FF0000]"></div>
                              <span className="font-bold text-[#0A0A0A] text-sm tracking-wide">{node.label || node.id}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                              <span className="text-[9px] font-mono text-[#999] border-2 border-[#E0E0E0] px-2 py-0.5 tracking-[0.2em] uppercase">GRP {node.group || '1'}</span>
                              <button 
                                onClick={() => setNodeToDelete(String(node.id))}
                                className="text-[#ccc] hover:text-[#FF0000] p-1 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#aaa] font-mono tracking-wider">ID: {node.id}</span>
                        </div>
                      );
                    })}
                    {graphData.nodes.length === 0 && <p className="text-xs text-[#bbb] font-mono px-1">No nodes extracted yet.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-mono font-bold text-[#999] uppercase tracking-[0.35em] mb-4 px-1">/ EXTRACTED EDGES</h3>
                  <div className="space-y-2">
                    {graphData.links.filter((l: Record<string, unknown>) => {
                      const src = typeof l.source === 'object' && l.source !== null ? (l.source as Record<string, string>).id : String(l.source);
                      const tgt = typeof l.target === 'object' && l.target !== null ? (l.target as Record<string, string>).id : String(l.target);
                      const lbl = typeof l.label === 'string' ? l.label : "";
                      const q = searchQuery.toLowerCase();
                      return src.includes(q) || tgt.includes(q) || lbl.toLowerCase().includes(q);
                    }).map((l: Record<string, unknown>, i) => {
                      const link = l as { source: unknown, target: unknown, label: string };
                      const srcId = typeof link.source === 'object' && link.source !== null ? (link.source as Record<string, string>).id : String(link.source);
                      const tgtId = typeof link.target === 'object' && link.target !== null ? (link.target as Record<string, string>).id : String(link.target);
                      return (
                        <div key={i} className="p-3.5 bg-[#FFFFFF] border-2 border-[#E0E0E0] flex flex-col gap-2 hover:border-[#0A0A0A] hover:shadow-[3px_3px_0_#0A0A0A] hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] transition-all">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#555] tracking-wider">
                            <span className="text-[#0A0A0A]">{srcId}</span>
                            <span className="text-[#FF0000]">→</span>
                            <span className="text-[#0A0A0A]">{tgtId}</span>
                          </div>
                          <div className="text-[11px] text-[#FF0000] bg-[#FF0000]/5 border-2 border-[#FF0000]/20 px-2.5 py-1 font-mono inline-flex w-fit tracking-wider">
                            {link.label}
                          </div>
                        </div>
                      );
                    })}
                    {graphData.links.length === 0 && <p className="text-xs text-[#bbb] font-mono px-1">No edges extracted yet.</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
