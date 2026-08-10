"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Send, Cpu, Database, Server, X, Search, Trash2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Graph from "./components/Graph";

type Message = {
  role: "user" | "agent" | "system";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", content: "Aura Knowledge Engine initialized. Input a topic, article, or unstructured text, and I will autonomously build a connected knowledge graph in CockroachDB." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = "http://32.196.225.218:8000";

  const fetchGraph = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/graph`);
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
      }
    } catch {
      console.error("Failed to fetch graph");
    }
  }, [API_URL]);

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
      const res = await fetch("http://32.196.225.218:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText })
      });
      
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "agent", content: `${data.agent_response}\n\n[System: Extracted ${data.extracted_nodes} entities and ${data.extracted_edges} relationships to CockroachDB]` }]);
        fetchGraph();
      } else {
        const errorData = await res.json();
        setMessages(prev => [...prev, { role: "agent", content: `Error: ${errorData.detail || 'Backend process failed.'}` }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: "agent", content: "Critical Error: Could not connect to Nexus backend. Ensure the server is running." }]);
    }
    
    setIsLoading(false);
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("http://32.196.225.218:8000/api/reset", { method: "POST" });
      if (res.ok) {
        setGraphData({ nodes: [], links: [] });
        setMessages(prev => [...prev, { role: "system", content: "System: Knowledge Graph has been safely wiped. Backup created." }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "agent", content: "Error: Failed to reset memory. Server might be restarting." }]);
    }
    setIsResetting(false);
    setIsWipeModalOpen(false);
  };

  const handleWipeModalOpen = () => {
    setIsWipeModalOpen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden font-sans bg-[#09090b] text-zinc-100">
      
      {/* Left Panel: Chat Interface */}
      <div className="w-full md:w-[500px] lg:w-[600px] xl:w-[650px] shrink-0 h-full bg-[#09090b] flex flex-col border-r border-white/5 z-10 relative shadow-2xl">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/10">
              <Image src="/logo_v4.png" alt="Aura Logo" width={20} height={20} className="object-contain opacity-90" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-zinc-100">AURA Engine</h1>
              <p className="text-[11px] text-zinc-500 font-medium tracking-wide">KNOWLEDGE GRAPH</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { fetchGraph(); setMessages(prev => [...prev, { role: "system", content: "System: Graph successfully synced with database." }]); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title="Refresh Graph"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleWipeModalOpen}
              disabled={isResetting}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
              title="Wipe Database"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 saas-scroll">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[90%] px-4 py-3 text-[13px] leading-relaxed rounded-xl saas-message ${
                  msg.role === 'user' 
                    ? 'bg-zinc-100 text-zinc-900 font-medium shadow-sm rounded-br-sm' 
                    : msg.role === 'system' 
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-tl-sm'
                    : 'bg-[#18181b] text-zinc-300 rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="max-w-[85%] px-4 py-3 rounded-xl text-[13px] bg-[#18181b] text-zinc-400 border border-white/5 rounded-tl-sm flex items-center gap-3 saas-message">
                <Cpu className="w-3.5 h-3.5 animate-spin text-zinc-300" /> Processing knowledge...
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form & Footer */}
        <div className="px-8 pb-8 pt-4 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent">
          <form onSubmit={handleSubmit} className="relative saas-input-shadow rounded-xl transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input unstructured text or concepts..." 
              className="w-full bg-[#18181b] border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg transition-colors disabled:opacity-50 disabled:bg-[#18181b] disabled:text-zinc-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          
          <div className="mt-5 flex items-center justify-between text-[10px] font-medium text-zinc-600 tracking-wide uppercase">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-zinc-500" /> CockroachDB
            </div>
            <div className="text-zinc-500">
              Crafted by <span className="text-zinc-300 font-semibold">Abhijeet Kangane</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: 3D Graph */}
      <div className="flex-1 h-full relative bg-[#09090b] overflow-hidden">
        <Graph data={graphData} />
        
        {/* Safe Wipe Modal */}
        <AnimatePresence>
          {isWipeModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0f0f11] border border-white/10 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4"
              >
                <h2 className="text-lg font-bold text-zinc-100 mb-2">Wipe Database?</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  Are you sure you want to permanently delete the entire knowledge graph? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsWipeModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    {isResetting ? "Wiping..." : "Yes, Wipe it"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Minimal Graph Stats Overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-6 right-8 flex items-center gap-3"
        >
          <div className="bg-[#18181b]/80 backdrop-blur-md border border-white/5 px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 flex items-center gap-5 shadow-lg">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-zinc-100"></div> Nodes: {graphData.nodes.length}</span>
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div> Edges: {graphData.links.length}</span>
          </div>
          <button onClick={() => setIsContextOpen(true)} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold transition-colors shadow-lg">
            <Server className="w-3.5 h-3.5" /> Database Context
          </button>
        </motion.div>

        {/* Database Context Sliding Panel */}
        <AnimatePresence>
          {isContextOpen && (
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[400px] bg-[#09090b]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col z-50"
            >
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#18181b]/50">
                <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
                  <Database className="w-4 h-4 text-indigo-400" /> Database Context
                </div>
                <button onClick={() => setIsContextOpen(false)} className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8 saas-scroll">
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search nodes or edges..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-1">Extracted Nodes</h3>
                  <div className="space-y-3">
                    {graphData.nodes.filter((n: Record<string, unknown>) => String(n.id).includes(searchQuery.toLowerCase()) || (typeof n.label === "string" && n.label.toLowerCase().includes(searchQuery.toLowerCase()))).map((n: Record<string, unknown>, i) => {
                      const node = n as { id: string, group?: string, label?: string };
                      return (
                        <div key={i} className="p-3.5 bg-[#0f0f11] border border-white/10 rounded-xl flex flex-col gap-2 hover:border-white/20 transition-all shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                              <span className="font-semibold text-zinc-200 text-sm">{node.label || node.id}</span>
                            </div>
                            <span className="text-[10px] font-medium text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Grp {node.group || '1'}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] text-zinc-500 font-mono">ID: {node.id}</span>
                          </div>
                        </div>
                      );
                    })}
                    {graphData.nodes.length === 0 && <p className="text-xs text-zinc-600 px-1">No nodes extracted yet.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 px-1">Extracted Edges</h3>
                  <div className="space-y-3">
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
                        <div key={i} className="p-3.5 bg-[#0f0f11] border border-white/10 rounded-xl flex flex-col gap-2 hover:border-white/20 transition-all shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                            <span className="text-zinc-100">{srcId}</span>
                            <span className="text-zinc-600">→</span>
                            <span className="text-zinc-100">{tgtId}</span>
                          </div>
                          <div className="text-[11px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md inline-flex w-fit">
                            {link.label}
                          </div>
                        </div>
                      );
                    })}
                    {graphData.links.length === 0 && <p className="text-xs text-zinc-600 px-1">No edges extracted yet.</p>}
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
