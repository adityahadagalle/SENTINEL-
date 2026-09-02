# SENTINEL Canvas Minimap Specification

## 1. Concept

The Minimap is an ultra-lightweight picture-in-picture SVG micro-map positioned at the bottom-right corner of the canvas. It renders a real-time scaled topology overview without external heavy dependencies.

---

## 2. Component Implementation

Implemented directly in `GraphCanvas.jsx`:

```jsx
const Minimap = ({ nodes = [], edges = [] }) => {
  const nodeCount = nodes.length;
  if (nodeCount === 0) return null;

  return (
    <div className="absolute bottom-3 right-3 p-2 bg-[#060B14]/90 backdrop-blur-md border border-[#1E2D4A] rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-20 select-none pointer-events-auto hidden md:block transition-all duration-300">
      <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-[#1A2640]/60">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-blue-400" />
          <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-slate-300">Canvas Minimap</span>
        </div>
        <span className="text-[7.5px] font-mono text-slate-500 font-semibold">{nodeCount} Nodes</span>
      </div>

      {/* SVG Micro-Map Canvas */}
      <svg className="w-28 h-14 bg-[#03060A] rounded-sm border border-[#101A2B]" viewBox="0 0 120 60">
        {edges.map((e, idx) => {
          const srcIdx = nodes.findIndex(n => n.id === e.source);
          const tgtIdx = nodes.findIndex(n => n.id === e.target);
          if (srcIdx === -1 || tgtIdx === -1) return null;
          const x1 = 15 + (srcIdx / (nodes.length - 1 || 1)) * 90;
          const y1 = 30 + ((srcIdx % 2 === 0 ? -1 : 1) * (srcIdx % 3)) * 8;
          const x2 = 15 + (tgtIdx / (nodes.length - 1 || 1)) * 90;
          const y2 = 30 + ((tgtIdx % 2 === 0 ? -1 : 1) * (tgtIdx % 3)) * 8;
          return (
            <line
              key={`mm-e-${idx}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={e.is_suspicious ? '#EF4444' : '#243352'}
              strokeWidth={e.is_suspicious ? 1.5 : 1}
              strokeOpacity={0.7}
            />
          );
        })}

        {nodes.map((n, idx) => {
          const x = 15 + (idx / (nodes.length - 1 || 1)) * 90;
          const y = 30 + ((idx % 2 === 0 ? -1 : 1) * (idx % 3)) * 8;
          const color = n.type === 'victim' ? '#3B82F6' : n.type === 'mule' ? '#EF4444' : n.type === 'merchant' ? '#10B981' : n.type === 'upi' ? '#8B5CF6' : '#F59E0B';
          return (
            <circle
              key={`mm-n-${n.id}`}
              cx={x}
              cy={y}
              r={n.type === 'mule' ? 3.5 : 2.5}
              fill={color}
            />
          );
        })}
      </svg>
    </div>
  );
};
```
