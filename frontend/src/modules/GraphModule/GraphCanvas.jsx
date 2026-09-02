import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback, useMemo } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { graphStyles, isCriticalNode } from './graphStyles';
import { getRole } from '../../roleStore';
import { maskAccount } from '../../utils/maskAccount';
import { deriveCaseTopology } from '../../utils/topologyEngine';
import { 
  ZoomIn, ZoomOut, Maximize2, RefreshCw, Play, Compass, 
  ShieldAlert, Lock, ArrowRight, UserCheck, Activity, ChevronRight 
} from 'lucide-react';
import RiskBadge from '../../components/RiskBadge';

// Register dagre layout plugin once
cytoscape.use(dagre);

const formatEdgeLabel = (edge) => {
  const amount = Number(edge.amount || 0);
  const channel = edge.channel || 'UPI';
  const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
  return `₹${formatted} · ${channel}`;
};

/**
 * Minimap Component — Interactive floating picture-in-picture graph preview with smooth viewport box.
 */
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

      {/* SVG Micro-Map */}
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

const GraphCanvas = forwardRef(({ nodes = [], edges = [], onNodeClick, caseData = {}, onHopTrace }, ref) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const onNodeClickRef = useRef(onNodeClick);
  const onHopTraceRef = useRef(onHopTrace);
  const [isTracing, setIsTracing] = useState(false);
  const [hoveredNodeData, setHoveredNodeData] = useState(null);
  const isTracingRef = useRef(false);
  const animFrameRef = useRef(null);

  useEffect(() => { onNodeClickRef.current = onNodeClick; }, [onNodeClick]);
  useEffect(() => { onHopTraceRef.current = onHopTrace; }, [onHopTrace]);

  // Derive genuine case-based topology with distinct nodes, edges, archetype, and dynamic label
  const topology = useMemo(() => {
    return deriveCaseTopology(nodes, edges, caseData);
  }, [nodes, edges, caseData]);

  const riskScore = Number(caseData.risk_level || 85);
  const ambientGlowColor = riskScore >= 85
    ? 'rgba(239, 68, 68, 0.08)'
    : riskScore >= 60
    ? 'rgba(245, 158, 11, 0.07)'
    : 'rgba(59, 130, 246, 0.06)';

  // ─── Continuous Motion Loop: Dash-Flow + Critical Node Breathing Glow ──────
  useEffect(() => {
    let offset = 0;
    const loop = () => {
      const cy = cyRef.current;
      if (cy) {
        offset = (offset + 0.5) % 24;
        // 1. Continuous money flow animation along dashed edges
        cy.edges('.suspicious-edge').style('line-dash-offset', -offset);

        // 2. Slow breathing glow on critical nodes (~2s cycle)
        const time = performance.now() * 0.003;
        const pulseBlur = 18 + Math.sin(time) * 8;
        const pulseOpacity = 0.65 + Math.sin(time) * 0.25;

        cy.nodes().forEach(node => {
          if (isCriticalNode(node) && !node.hasClass('dimmed')) {
            node.style({
              'shadow-blur': pulseBlur,
              'shadow-opacity': pulseOpacity
            });
          }
        });
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ─── Sequential Hop-by-Hop Trace Path Animation (Source -> Mule -> Destination)
  const traceSuspiciousPath = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || isTracingRef.current) return;
    isTracingRef.current = true;
    setIsTracing(true);

    cy.elements().removeClass('highlighted dimmed traced-edge');

    const pathEdges = cy.edges().sort((a, b) =>
      (a.data('time') || '').localeCompare(b.data('time') || '')
    );

    let step = 0;
    const interval = setInterval(() => {
      if (step < pathEdges.length) {
        const edge = pathEdges[step];
        edge.addClass('traced-edge');
        edge.source().addClass('highlighted');
        edge.target().addClass('highlighted');

        cy.elements()
          .not(edge)
          .not(edge.source())
          .not(edge.target())
          .addClass('dimmed');

        onHopTraceRef.current?.(step);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          cy.elements().removeClass('dimmed traced-edge');
          isTracingRef.current = false;
          setIsTracing(false);
        }, 1400);
      }
    }, 450);
  }, []);

  // ─── Imperative handle for parent (GraphModule) ───────────────────────────
  useImperativeHandle(ref, () => ({
    highlightNode: (nodeId, duration = 1600) => {
      const cy = cyRef.current;
      if (!cy) return;
      const node = cy.getElementById(nodeId);
      if (node.length > 0) node.flashClass('highlighted', duration);
    },
    highlightHop: (hopIndex) => {
      const cy = cyRef.current;
      if (!cy) return;
      cy.elements().removeClass('highlighted dimmed traced-edge');
      const allEdges = cy.edges();
      const edge = allEdges[hopIndex % allEdges.length];
      if (edge && edge.length > 0) {
        edge.addClass('traced-edge');
        edge.source().addClass('highlighted');
        edge.target().addClass('highlighted');
        cy.elements().not(edge.connectedNodes().add(edge)).addClass('dimmed');
      }
    },
    traceSuspiciousPath,
    fit: () => { cyRef.current?.fit(cyRef.current.elements(), 40); }
  }));

  // ─── Controls ─────────────────────────────────────────────────────────────
  const handleZoomIn  = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: cy.zoom() * 1.25, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  }, []);

  const handleZoomOut = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: cy.zoom() * 0.8, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  }, []);

  const handleFit = useCallback(() => cyRef.current?.fit(cyRef.current.elements(), 40), []);

  const runLayout = useCallback((cy, animate = false) => {
    if (!cy || cy.elements().length === 0) return;

    cy.layout({
      name: 'dagre',
      rankDir: 'LR',
      nodeSep: 65,
      rankSep: 145,
      edgeSep: 20,
      ranker: 'network-simplex',
      animate,
      animationDuration: 400,
      animationEasing: 'ease-out',
      padding: 45,
      fit: true
    }).run();
  }, []);

  const handleResetLayout = useCallback(() => {
    runLayout(cyRef.current, true);
  }, [runLayout]);

  // ─── Cytoscape Mount ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: graphStyles,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.2,
      maxZoom: 4.0,
    });

    cyRef.current = cy;

    // Node click -> Select node & open Entity Inspector
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const neighborhood = node.neighborhood().add(node);
      cy.elements().removeClass('highlighted dimmed');
      cy.elements().not(neighborhood).addClass('dimmed');
      neighborhood.addClass('highlighted');
      
      const nodeData = {
        id: node.id(),
        status: node.data('status'),
        type: node.data('type'),
        risk_score: node.data('type') === 'mule' ? 98 : node.data('type') === 'victim' ? 25 : 85,
        inflow: '₹80,852',
        outflow: '₹79,235',
        layer: node.data('layer'),
        ...node.data()
      };
      setHoveredNodeData(nodeData);
      onNodeClickRef.current?.(nodeData);
    });

    // Node Hover -> Connected Edge Highlight & Graph Dim
    cy.on('mouseover', 'node', (evt) => {
      if (isTracingRef.current) return;
      const node = evt.target;
      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass('dimmed');
      neighborhood.removeClass('dimmed').addClass('hovered-focus');

      setHoveredNodeData({
        id: node.id(),
        type: node.data('type'),
        risk_score: node.data('type') === 'mule' ? 98 : node.data('type') === 'victim' ? 25 : 85,
        inflow: '₹80,852',
        outflow: '₹79,235'
      });
    });

    cy.on('mouseout', 'node', () => {
      if (isTracingRef.current) return;
      cy.elements().removeClass('dimmed hovered-focus');
    });

    // Background click -> Reset focus
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted dimmed traced-edge hovered-focus');
        setHoveredNodeData(null);
        onNodeClickRef.current?.(null);
      }
    });

    return () => {
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, []);

  // ─── Sync Elements with Staggered Hop Entrance Animation ──────────────────
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const role = getRole();

    cy.batch(() => {
      cy.elements().remove();

      // Add Nodes with type and layout metadata
      topology.nodes.forEach(node => {
        const id = String(node.id || node.accountId || '');
        const displayLabel = role === 'admin' ? id : maskAccount(id);
        cy.add({
          group: 'nodes',
          data: {
            id,
            displayLabel,
            status: node.status || 'active',
            type: node.type || 'mule',
            layer: node.layer !== undefined ? node.layer : 0
          },
          style: {
            'opacity': 0
          }
        });
      });

      // Add Edges
      topology.edges.forEach((edge, idx) => {
        const id = edge.id || `e-${idx}`;
        const sourceId = String(edge.source || edge.from || '');
        const targetId = String(edge.target || edge.to || '');

        if (!cy.getElementById(sourceId).length || !cy.getElementById(targetId).length) return;

        const el = cy.add({
          group: 'edges',
          data: {
            id,
            source: sourceId,
            target: targetId,
            amount: edge.amount,
            channel: edge.channel,
            time: edge.time || edge.timestamp || '',
            label: formatEdgeLabel(edge)
          },
          style: {
            'opacity': 0
          }
        });

        if (edge.is_suspicious || Number(edge.amount || 0) > 80000) {
          el.addClass('suspicious-edge');
        }
      });
    });

    runLayout(cy, false);

    // Staggered forensic reveal animation by hop distance
    const maxHop = Math.max(...topology.nodes.map(n => n.layer || 0), 3);
    for (let hop = 0; hop <= maxHop; hop++) {
      setTimeout(() => {
        if (!cyRef.current) return;
        const hopNodes = cyRef.current.nodes().filter(n => (n.data('layer') || 0) === hop);
        const hopEdges = cyRef.current.edges().filter(e => {
          const srcLayer = e.source().data('layer') || 0;
          return srcLayer === hop - 1 || (hop === 0 && srcLayer === 0);
        });

        hopNodes.animate({
          style: { 'opacity': 1 },
          duration: 220,
          easing: 'ease-out'
        });
        hopEdges.animate({
          style: { 'opacity': 0.85 },
          duration: 200,
          easing: 'ease-out'
        });
      }, hop * 90);
    }
  }, [topology, runLayout]);

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        backgroundColor: '#080D18',
        backgroundImage: `radial-gradient(circle at 50% 50%, ${ambientGlowColor} 0%, transparent 70%), radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.12) 1px, transparent 0)`,
        backgroundSize: '100% 100%, 24px 24px'
      }}
    >
      {/* Cytoscape mount DOM element */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Investigation HUD (Top Left) */}
      <div className="absolute top-3 left-3 flex items-center gap-1 p-1 bg-[#0C1220]/95 backdrop-blur-md border border-[#1E2D4A] rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-20">
        <button onClick={handleZoomIn}  className="p-1.5 rounded-sm hover:bg-[#131E2E] text-slate-400 hover:text-slate-200 transition-colors" title="Zoom In">
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleZoomOut} className="p-1.5 rounded-sm hover:bg-[#131E2E] text-slate-400 hover:text-slate-200 transition-colors" title="Zoom Out">
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3.5 bg-[#1A2640]" />
        <button onClick={handleFit} className="p-1.5 rounded-sm hover:bg-[#131E2E] text-slate-400 hover:text-slate-200 transition-colors" title="Fit View">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleResetLayout} className="p-1.5 rounded-sm hover:bg-[#131E2E] text-slate-400 hover:text-slate-200 transition-colors" title="Reset Layout (DAG)">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3.5 bg-[#1A2640]" />
        <button
          onClick={traceSuspiciousPath}
          disabled={isTracing}
          className="flex items-center gap-1 px-3 py-1 rounded-sm bg-blue-600/25 hover:bg-blue-600/35 border border-blue-500/50 text-blue-300 text-[9px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(59,130,246,0.35)] animate-pulse"
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          <span>{isTracing ? 'Tracing Flow...' : 'Trace Path'}</span>
        </button>
      </div>

      {/* Dynamic Topology Label Badge (Top-Right) */}
      <div className="absolute top-3 right-3 px-3 py-1.5 bg-[#0C1220]/95 backdrop-blur-md border border-[#1E2D4A] rounded-sm text-[9px] font-mono text-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] z-20 select-none flex items-center gap-2">
        <span className="text-blue-400 font-bold uppercase tracking-wider">Topology:</span>
        <span className="text-slate-200 font-semibold">{topology.label}</span>
      </div>

      {/* Contextual Floating Entity Card on Node Hover/Focus (Bottom-Left) */}
      {hoveredNodeData && (
        <div className="absolute bottom-3 left-3 p-2.5 bg-[#0C1424]/95 backdrop-blur-md border border-blue-500/40 rounded-sm shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-20 select-none text-[9px] font-mono max-w-[240px] animate-fade-in">
          <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-[#1A2640]">
            <span className="text-blue-400 font-bold truncate">{hoveredNodeData.id}</span>
            <span className="text-[7.5px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 uppercase font-bold">
              {hoveredNodeData.type || 'MULE'}
            </span>
          </div>
          <div className="space-y-0.5 text-slate-400 text-[8.5px]">
            <div className="flex justify-between">
              <span>Assessed Risk:</span>
              <span className="text-rose-400 font-bold">{hoveredNodeData.risk_score || 98}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Flow Activity:</span>
              <span className="text-slate-200 font-semibold">{hoveredNodeData.inflow} → {hoveredNodeData.outflow}</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Minimap (Bottom-Right) */}
      <Minimap nodes={topology.nodes} edges={topology.edges} />
    </div>
  );
});

GraphCanvas.displayName = 'GraphCanvas';
export default GraphCanvas;
