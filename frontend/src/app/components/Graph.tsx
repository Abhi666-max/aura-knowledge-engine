"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ZoomIn, ZoomOut } from "lucide-react";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), { ssr: false });

export default function Graph({ data }: { data: any }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);

  const getNodeColor = (node: Record<string, unknown>) => {
    const colors = ["#818cf8", "#34d399", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa"];
    const hash = String(node.id).split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const handleZoom = (direction: 'in' | 'out' | 'fit') => {
    if (!fgRef.current) return;
    if (direction === 'fit') {
      fgRef.current.zoomToFit(500, 50, () => true);
    } else {
      const pos = fgRef.current.cameraPosition();
      const currentDist = Math.hypot(pos.x, pos.z);
      const factor = direction === 'in' ? 0.7 : 1.4;
      let newDist = currentDist * factor;
      if (newDist > 1500) newDist = 1500; // Enforce max zoom out
      
      const currentAngle = Math.atan2(pos.x, pos.z);
      fgRef.current.cameraPosition(
        { 
          x: newDist * Math.sin(currentAngle), 
          y: newDist * 0.7, // Keep some elevation 
          z: newDist * Math.cos(currentAngle) 
        }, { x: 0, y: 0, z: 0 }, 500);
    }
  };

  useEffect(() => {
    // Configure physics engine to spread nodes out widely (SaaS style)
    if (fgRef.current) {
      const charge = fgRef.current.d3Force('charge');
      if (charge) charge.strength(-400); // Repel nodes strongly so they use the full screen
      
      const link = fgRef.current.d3Force('link');
      if (link) link.distance(100); // Increase distance between connected nodes
    }
  }, [data]); // Re-apply when data changes

  useEffect(() => {
    // Make the camera slowly rotate around the graph smoothly respecting zoom
    let angle = 0;
    const interval = setInterval(() => {
      if (fgRef.current) {
        const pos = fgRef.current.cameraPosition();
        let safeDist = Math.hypot(pos.x, pos.z);
        if (safeDist > 1500) safeDist = 1500;
        
        fgRef.current.cameraPosition({
          x: safeDist * Math.sin(angle),
          z: safeDist * Math.cos(angle)
        });
        angle += Math.PI / 300;
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative z-0">
      {data && data.nodes && data.nodes.length > 0 ? (
        <ForceGraph3D
          ref={fgRef}
          graphData={data}
          nodeColor={getNodeColor}
          linkColor={() => "rgba(255,255,255,0.4)"}
          linkWidth={1.5}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          linkDirectionalParticleColor={() => "#60a5fa"}
          linkDirectionalParticleWidth={3}
          nodeLabel="label"
          linkLabel="label"
          backgroundColor="#00000000" // Transparent
          showNavInfo={false}
        />
      ) : (
        <div className="flex items-center justify-center h-full text-zinc-500 font-sans text-[13px] tracking-wide">
          Awaiting input to generate knowledge graph...
        </div>
      )}
      
      {/* Zoom Controls */}
      {data && data.nodes && data.nodes.length > 0 && (
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 bg-[#18181b]/90 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-xl z-50">
          <button onClick={() => handleZoom('in')} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-[1px] w-full bg-white/10"></div>
          <button onClick={() => handleZoom('fit')} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors text-xs font-bold font-mono" title="Focus (Fit to screen)">
            [ ]
          </button>
          <div className="h-[1px] w-full bg-white/10"></div>
          <button onClick={() => handleZoom('out')} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
