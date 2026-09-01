import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import { graphStyles } from './graphStyles';
import { getRole } from '../../roleStore';
import { maskAccount } from '../../utils/maskAccount';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, Flame } from 'lucide-react';

const formatTransactionLabel = (edge) => {
  const amount = Number(edge.amount || 0);
  const time = edge.time || edge.timestamp || '';
  const formattedAmount = new Intl.NumberFormat('en-IN').format(amount);
  return time ? `₹${formattedAmount} • ${time}` : `₹${formattedAmount}`;
};

const getGraphBounds = (container) => {
  const width = container?.clientWidth || 800;
  const height = container?.clientHeight || 600;
  const padding = Math.max(36, Math.min(60, Math.floor(Math.min(width, height) * 0.08)));
  return { width, height, padding };
};

const getNodeDepths = (nodes, edges) => {
  const ids = nodes.map((node) => String(node.accountId || node.id));
  const indegree = new Map(ids.map((id) => [id, 0]));
  const children = new Map(ids.map((id) => [id, []]));

  edges.forEach((edge) => {
    const source = String(edge.source);
    const target = String(edge.target);
    if (!indegree.has(source) || !indegree.has(target)) return;
    indegree.set(target, indegree.get(target) + 1);
    children.get(source).push(target);
  });

  const depths = new Map();
  let queue = ids.filter((id) => indegree.get(id) === 0);
  if (queue.length === 0 && ids.length > 0) queue = [ids[0]];

  queue.forEach((id) => depths.set(id, 0));

  while (queue.length > 0) {
    const id = queue.shift();
    const nextDepth = (depths.get(id) || 0) + 1;
    children.get(id)?.forEach((childId) => {
      if (!depths.has(childId) || nextDepth > depths.get(childId)) {
        depths.set(childId, nextDepth);
        queue.push(childId);
      }
    });
  }

  ids.forEach((id) => {
    if (!depths.has(id)) depths.set(id, 0);
  });

  return depths;
};

const positionNode = (cy, id, position, animate) => {
  const node = cy.getElementById(id);
  if (node.length === 0) return;

  if (animate) {
    node.stop();
    node.animate({ position }, { duration: 350 });
  } else {
    node.position(position);
  }
};

const applyDashboardLayout = (cy, nodes, edges, container, animate) => {
  const { width, height, padding } = getGraphBounds(container);
  const usableWidth = Math.max(width - padding * 2, 1);
  const usableHeight = Math.max(height - padding * 2, 1);
  const depths = getNodeDepths(nodes, edges);
  const columns = new Map();

  nodes.forEach((node) => {
    const id = String(node.accountId || node.id);
    const depth = depths.get(id) || 0;
    if (!columns.has(depth)) columns.set(depth, []);
    columns.get(depth).push(id);
  });

  const sortedDepths = Array.from(columns.keys()).sort((a, b) => a - b);
  const lastColumnIndex = Math.max(sortedDepths.length - 1, 1);

  sortedDepths.forEach((depth, columnIndex) => {
    const ids = columns.get(depth).sort();
    ids.forEach((id, rowIndex) => {
      const x = padding + (usableWidth * columnIndex) / lastColumnIndex;
      const y = padding + (usableHeight * (rowIndex + 1)) / (ids.length + 1);
      positionNode(cy, id, { x, y }, animate);
    });
  });
};

const layoutConfig = {
  name: 'breadthfirst',
  directed: true,
  spacingFactor: 1.6,
  padding: 40,
  avoidOverlap: true
};

const GraphCanvas = forwardRef(({ nodes = [], edges = [], onNodeClick }, ref) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const isInitializedRef = useRef(false);
  const onNodeClickRef = useRef(onNodeClick);

  useEffect(() => {
    onNodeClickRef.current = onNodeClick;
  }, [onNodeClick]);

  // Imperative handle for parent triggers
  useImperativeHandle(ref, () => ({
    highlightNode: (nodeId, duration = 1200) => {
      const cy = cyRef.current;
      if (!cy) return;
      const node = cy.getElementById(nodeId);
      if (node.length > 0) {
        node.flashClass('highlighted', duration);
      }
    },
    fit: () => {
      cyRef.current?.fit(cyRef.current.elements(), 50);
    }
  }));

  // Controls Callbacks
  const handleZoomIn = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: cy.zoom() * 1.25, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  }, []);

  const handleZoomOut = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: cy.zoom() * 0.8, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  }, []);

  const handleFit = useCallback(() => {
    cyRef.current?.fit(cyRef.current.elements(), 50);
  }, []);

  const handleResetLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || nodes.length === 0) return;
    applyDashboardLayout(cy, nodes, edges, containerRef.current, true);
    cy.fit(cy.elements(), 50);
  }, [nodes, edges]);

  // Highlight all high-risk suspicious flow edges
  const handleHighlightSuspicious = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.edges().forEach((e) => {
      const amount = Number(e.data('amount') || 0);
      if (amount > 100000 || (e.data('label') && e.data('label').includes('suspicious'))) {
        e.addClass('suspicious-edge');
      }
    });
  }, []);

  // 1. Setup Cytoscape Instance
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: graphStyles,
      layout: layoutConfig,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.2,
      maxZoom: 3.0
    });

    cyRef.current = cy;
    isInitializedRef.current = true;

    // Node Click -> Neighborhood focus
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const neighborhood = node.neighborhood().add(node);

      cy.elements().removeClass('highlighted dimmed');
      cy.elements().not(neighborhood).addClass('dimmed');
      neighborhood.addClass('highlighted');

      onNodeClickRef.current?.({ id: node.id(), status: node.data('status') });
    });

    // Background Click -> Reset focus
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted dimmed show-label');
        onNodeClickRef.current?.(null);
      }
    });

    // Edge Hover -> Show transaction amount
    cy.on('mouseover', 'edge', (evt) => {
      evt.target.addClass('show-label');
    });

    cy.on('mouseout', 'edge', (evt) => {
      if (!evt.target.hasClass('highlighted')) {
        evt.target.removeClass('show-label');
      }
    });

    return () => {
      cyRef.current?.destroy();
      cyRef.current = null;
      isInitializedRef.current = false;
    };
  }, []);

  // 2. Resize Observer
  useEffect(() => {
    const container = containerRef.current;
    const cy = cyRef.current;
    if (!container || !cy || !window.ResizeObserver) return undefined;

    const observer = new ResizeObserver(() => {
      cy.resize();
      if (nodes.length > 0) {
        applyDashboardLayout(cy, nodes, edges, container, false);
        cy.fit(cy.elements(), getGraphBounds(container).padding);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [nodes, edges]);

  // 3. Synchronize Graph Elements
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !isInitializedRef.current) return;

    cy.batch(() => {
      const role = getRole();
      const currentIds = new Set();

      // Nodes
      nodes.forEach((item) => {
        const nodeId = String(item.accountId || item.id);
        currentIds.add(nodeId);
        const displayLabel = role === "admin" ? nodeId : maskAccount(nodeId);

        const existing = cy.getElementById(nodeId);
        if (existing.length > 0) {
          existing.data({ ...item, displayLabel });
        } else {
          cy.add({ data: { ...item, id: nodeId, displayLabel } });
        }
      });

      // Edges
      edges.forEach((edge) => {
        const edgeId = String(edge.id || edge.tx_id || `${edge.source}-${edge.target}`);
        currentIds.add(edgeId);

        const existing = cy.getElementById(edgeId);
        const label = edge.label || formatTransactionLabel(edge);
        if (existing.length > 0) {
          existing.data({ ...edge, label });
        } else {
          cy.add({ data: { ...edge, id: edgeId, label } });
        }
      });

      // Remove Stale Elements
      cy.elements().forEach((ele) => {
        if (!currentIds.has(ele.id())) {
          ele.remove();
        }
      });
    });

    if (nodes.length > 0) {
      applyDashboardLayout(cy, nodes, edges, containerRef.current, false);
      cy.fit(cy.elements(), 50);
    }
  }, [nodes, edges]);

  return (
    <div className="relative w-full h-full bg-[#0B1120] overflow-hidden select-none">
      {/* Cytoscape Container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: '#0B1120' }}
      />

      {/* Floating Canvas Controls Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-lg bg-[#0D1829]/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <button
          onClick={handleZoomIn}
          className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-800" />
        <button
          onClick={handleFit}
          className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Fit to View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetLayout}
          className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Reset Layout"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleHighlightSuspicious}
          className="px-2 h-7 rounded flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 hover:bg-rose-950/40 border border-rose-900/30 transition-colors"
          title="Highlight High-Risk Flows"
        >
          <Flame className="w-3 h-3 text-rose-500" />
          <span>Trace Risk</span>
        </button>
      </div>
    </div>
  );
});

export default React.memo(GraphCanvas);
