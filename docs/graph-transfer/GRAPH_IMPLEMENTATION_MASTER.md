# SENTINEL INVESTIGATION GRAPH — MASTER TRANSFER & REPRODUCTION SPECIFICATION

> **Target Audience**: AI Coding Assistants & Senior Frontend Engineers reproducing the SENTINEL Investigation Graph in another codebase.
> **Source Repository Version**: SENTINEL Enterprise v2.0 (Approved Production Build)
> **Engine**: Cytoscape.js (`^3.28.1`) + `cytoscape-dagre` (`^4.0.1`)

---

## 1. Executive Technical Summary

The SENTINEL Investigation Graph is a financial-crime investigation workstation designed to visualize multi-hop money laundering cascades (1 to 6 hops). It provides:
1. **GPU-Accelerated HTML5 Canvas Rendering** via Cytoscape.js.
2. **Left-to-Right Hierarchical DAG Layout** via Dagre Network-Simplex algorithm.
3. **Forensic Entity Micro-Glyphs** (50% scale, ~12px crisp geometric SVGs with ~23px breathing room).
4. **Pseudo-3D Spherical Radial Shading** across distinct node geometries (octagons, hexagons, diamonds, rounded rectangles).
5. **Real-Time Money Flow Animation Loop** via continuous dashed-edge translation.
6. **Sequential Hop-by-Hop Trace Path Playback** with automatic background dimming and timeline synchronization.
7. **Dual-Mode Forensic Inspector** (Explainable AI Overview vs Dedicated Entity Deep-Dive).
8. **Embedded SVG Picture-in-Picture Minimap**.

---

## 2. Directory & Module File Structure

```
frontend/
├── package.json
└── src/
    ├── utils/
    │   ├── topologyEngine.js     # 6 Forensic crime archetypes & case classifier
    │   └── maskAccount.js        # RBAC account masking utility
    ├── components/
    │   ├── CaseBanner.jsx        # Top 2-second scannable case intelligence strip
    │   └── RiskBadge.jsx         # Severity pill badge
    ├── modules/
    │   └── GraphModule/
    │       ├── GraphModule.jsx   # Master layout coordinator grid
    │       ├── GraphCanvas.jsx   # Cytoscape core canvas, HUD, & Minimap
    │       ├── graphStyles.js    # Cytoscape stylesheet & inline SVG micro-glyphs
    │       ├── ActionPanel.jsx   # Dual-mode AI & Entity Inspector
    │       ├── TimelineScrubber.jsx # 7-stage autonomous investigation stepper
    │       ├── RecoveryBar.jsx   # Capital recovery telemetry header
    │       └── Legend.jsx        # Floating geometry legend
    └── pages/
        └── Graph.jsx             # Top-level routing wrapper (/graph/:caseId)
```

---

## 3. Dependency Manifest

Install with npm:
```bash
npm install cytoscape@^3.28.1 cytoscape-dagre@^4.0.1 lucide-react@^0.344.0 clsx@^2.1.0 tailwind-merge@^2.2.1
```

---

## 4. Graph Data Contract

```typescript
export interface SentinelNode {
  id: string;              // e.g. "ACC-VICTIM-4731", "ACC-MUL-6109"
  displayLabel?: string;   // e.g. "ACC-VICTIM-4731" or "ACC-V...4731"
  status: 'active' | 'flagged' | 'frozen' | 'withdrawn' | 'victim';
  type: 'victim' | 'mule' | 'merchant' | 'upi' | 'cashout' | 'crypto' | 'collector' | 'individual';
  layer: number;           // Hop depth (0 = Source Feeder, 1+ = Downstream)
  balance?: number;
}

export interface SentinelEdge {
  id: string;              // e.g. "e-vo-0", "e-hop-1"
  source: string;          // Source account ID
  target: string;          // Target account ID
  amount: number;          // Transfer volume in INR
  channel: 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'CARD' | 'SWIFT';
  time: string;            // Timestamp string
  is_suspicious: boolean;  // Triggers dashed red animation
}

export interface SentinelCasePayload {
  case_id: string;
  status: string;
  risk_level: number;
  total_fraud_amount: number;
  recovered_amount: number;
  recoverable_amount: number;
  golden_window_minutes: number;
  primary_tx_id?: string;
  nodes: SentinelNode[];
  edges: SentinelEdge[];
}
```

---

## 5. Exact Cytoscape Stylesheet Implementation (`graphStyles.js`)

```javascript
import cytoscape from 'cytoscape';

const makeSvgUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;

// 50% scale micro-glyphs inside 48x48 centered viewBox (-12 -12 48 48)
export const SVG_ICONS = {
  victim: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-12 -12 48 48" fill="none" stroke="#60A5FA" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="3.5"/><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0"/>
    </svg>
  `),
  mule: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-12 -12 48 48" fill="none" stroke="#EF4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3.8 2.5 19.5h19L12 3.8z"/><line x1="12" y1="9.5" x2="12" y2="13.5"/><circle cx="12" cy="16.5" r="0.75" fill="#EF4444"/>
    </svg>
  `),
  merchant: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-12 -12 48 48" fill="none" stroke="#10B981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 8.5 4.5 3.5h15L21 8.5"/><path d="M3 8.5v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-11"/><path d="M3 8.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M10 20.5v-6h4v6"/>
    </svg>
  `),
  upi: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-12 -12 48 48" fill="none" stroke="#C084FC" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="13 2 4 13.5 11.5 13.5 10 22 20 10.5 12.5 10.5 13 2"/>
    </svg>
  `),
  cashout: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-12 -12 48 48" fill="none" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.5"/><line x1="6.5" y1="12" x2="6.51" y2="12"/><line x1="17.5" y1="12" x2="17.51" y2="12"/>
    </svg>
  `),
  crypto: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-12 -12 48 48" fill="none" stroke="#06B6D4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9.5"/><path d="M14.5 8.5h-4a1.5 1.5 0 0 0 0 3h3.5a1.5 1.5 0 0 1 0 3H9.5"/><line x1="12" y1="6" x2="12" y2="18"/>
    </svg>
  `),
  collector: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-12 -12 48 48" fill="none" stroke="#FB923C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2.5 2.5 7.5 12 12.5 21.5 7.5 12 2.5"/><polyline points="2.5 12 12 17 21.5 12"/><polyline points="2.5 16.5 12 21.5 21.5 16.5"/>
    </svg>
  `),
  individual: makeSvgUri(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="-12 -12 48 48" fill="none" stroke="#94A3B8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="3.5"/><path d="M5.5 19.5a6.5 6.5 0 0 1 13 0"/>
    </svg>
  `)
};

export const NODE_CONFIG = {
  victim:     { bg: '#0A1838', innerGlow: '#1E3A8A', border: '#3B82F6', borderWidth: 2.5, shape: 'ellipse',         size: 58 },
  mule:       { bg: '#380707', innerGlow: '#7F1D1D', border: '#EF4444', borderWidth: 3.0, shape: 'polygon',         size: 60 },
  merchant:   { bg: '#022417', innerGlow: '#065F46', border: '#10B981', borderWidth: 2.5, shape: 'round-rectangle', size: 56 },
  upi:        { bg: '#200C44', innerGlow: '#4C1D95', border: '#8B5CF6', borderWidth: 2.5, shape: 'diamond',         size: 58 },
  cashout:    { bg: '#361600', innerGlow: '#78350F', border: '#F59E0B', borderWidth: 2.5, shape: 'polygon',         size: 58 },
  crypto:     { bg: '#03232C', innerGlow: '#155E75', border: '#06B6D4', borderWidth: 2.5, shape: 'polygon',         size: 58 },
  collector:  { bg: '#331505', innerGlow: '#7C2D12', border: '#F97316', borderWidth: 3.0, shape: 'round-rectangle', size: 62 },
  individual: { bg: '#0F172A', innerGlow: '#1E293B', border: '#475569', borderWidth: 2.0, shape: 'ellipse',         size: 50 },
};

const OCTAGON_POINTS = [-0.383, -0.924, 0.383, -0.924, 0.924, -0.383, 0.924, 0.383, 0.383, 0.924, -0.383, 0.924, -0.924, 0.383, -0.924, -0.383];
const HEXAGON_POINTS = [0, -1, 0.866, -0.5, 0.866, 0.5, 0, 1, -0.866, 0.5, -0.866, -0.5];

export const getNodeType = (node) => {
  const explicitType = (node.data('type') || '').toLowerCase();
  if (NODE_CONFIG[explicitType]) return explicitType;
  const id = (node.data('id') || '').toUpperCase();
  if (id.includes('VICTIM') || id.includes('ORIGIN') || id.includes('FEEDER')) return 'victim';
  if (id.includes('MULE') || id.includes('WASH')) return 'mule';
  if (id.includes('MERCH') || id.includes('RETAIL') || id.includes('POS')) return 'merchant';
  if (id.includes('UPI') || id.includes('@')) return 'upi';
  if (id.includes('CASH') || id.includes('ATM') || id.includes('EXIT')) return 'cashout';
  if (id.includes('CRYPTO') || id.includes('DESK')) return 'crypto';
  if (id.includes('COLLECTOR') || id.includes('HUB')) return 'collector';
  return 'mule';
};

export const isCriticalNode = (node) => {
  const type = getNodeType(node);
  const status = (node.data('status') || '').toLowerCase();
  return type === 'mule' || type === 'collector' || status === 'flagged';
};

export const graphStyles = [
  {
    selector: 'node',
    style: {
      'label':                   (n) => n.data('displayLabel') || n.data('id') || '',
      'shape':                   (n) => NODE_CONFIG[getNodeType(n)]?.shape || 'ellipse',
      'shape-polygon-points':    (n) => {
        const t = getNodeType(n);
        if (t === 'crypto') return HEXAGON_POINTS;
        if (['mule', 'cashout'].includes(t)) return OCTAGON_POINTS;
        return undefined;
      },
      'background-fill':         'radial-gradient',
      'background-gradient-stop-colors': (n) => {
        const t = getNodeType(n);
        const c = NODE_CONFIG[t] || NODE_CONFIG.mule;
        return `${c.innerGlow} ${c.bg}`;
      },
      'background-gradient-stop-positions': '0% 100%',
      'background-color':        (n) => NODE_CONFIG[getNodeType(n)]?.bg || '#0F172A',
      'border-color':            (n) => NODE_CONFIG[getNodeType(n)]?.border || '#475569',
      'border-width':            (n) => NODE_CONFIG[getNodeType(n)]?.borderWidth || 2.5,
      'border-style':            (n) => n.data('status') === 'withdrawn' ? 'dashed' : 'solid',
      'width':                   (n) => NODE_CONFIG[getNodeType(n)]?.size || 58,
      'height':                  (n) => NODE_CONFIG[getNodeType(n)]?.size || 58,
      'background-image':        (n) => SVG_ICONS[getNodeType(n)] || SVG_ICONS.individual,
      'background-fit':          'none',
      'background-width':        '24px',
      'background-height':       '24px',
      'background-position-x':   '50%',
      'background-position-y':   '50%',
      'background-image-opacity': 0.92,
      'shadow-blur':             (n) => isCriticalNode(n) ? 22 : 6,
      'shadow-color':            (n) => isCriticalNode(n) ? '#EF4444' : '#000000',
      'shadow-opacity':          (n) => isCriticalNode(n) ? 0.80 : 0.45,
      'color':                   '#F8FAFC',
      'text-valign':             'bottom',
      'text-halign':             'center',
      'text-margin-y':           8,
      'font-size':               9,
      'font-family':             'JetBrains Mono, monospace',
      'font-weight':             600,
      'text-background-color':   '#050A14',
      'text-background-opacity': 0.92,
      'text-background-padding': '3px',
      'text-background-shape':   'round-rectangle',
      'text-border-color':       '#1A2640',
      'text-border-width':       1,
      'text-border-opacity':     0.9,
      'text-max-width':          '120px',
      'text-wrap':               'ellipsis',
      'transition-property':     'background-color, border-color, border-width, opacity, shadow-blur, shadow-opacity, transform, background-width, background-height, background-image-opacity',
      'transition-duration':     '0.18s'
    }
  },
  {
    selector: 'edge',
    style: {
      'label':                   'data(label)',
      'width':                   1.8,
      'line-color':              '#243352',
      'target-arrow-color':      '#3D4F6B',
      'target-arrow-shape':      'triangle',
      'arrow-scale':             0.8,
      'curve-style':             'bezier',
      'control-point-step-size': 40,
      'font-size':               8,
      'font-family':             'JetBrains Mono, monospace',
      'font-weight':             500,
      'text-rotation':           'autorotate',
      'text-margin-y':           -8,
      'text-background-color':   '#0A0F1D',
      'text-background-opacity': 0.95,
      'text-background-padding': '3px',
      'text-border-color':       '#1A2640',
      'text-border-width':       1,
      'text-border-opacity':     1,
      'color':                   '#64748B',
      'opacity':                 0.85,
      'transition-property':     'line-color, target-arrow-color, opacity, width, shadow-blur',
      'transition-duration':     '0.25s'
    }
  },
  {
    selector: 'edge.suspicious-edge',
    style: {
      'width':                   2.5,
      'line-color':              '#EF4444',
      'target-arrow-color':      '#EF4444',
      'line-style':              'dashed',
      'line-dash-pattern':       [8, 4],
      'opacity':                 1.0,
      'z-index':                 20,
      'color':                   '#FCA5A5',
      'font-weight':             700,
      'text-background-color':   '#160808',
      'text-border-color':       '#7F1D1D',
      'shadow-blur':             8,
      'shadow-color':            '#EF4444',
      'shadow-opacity':          0.4
    }
  },
  {
    selector: 'edge.traced-edge',
    style: {
      'width':                   4.0,
      'line-color':              '#3B82F6',
      'target-arrow-color':      '#60A5FA',
      'line-style':              'solid',
      'opacity':                 1.0,
      'z-index':                 35,
      'color':                   '#93C5FD',
      'font-weight':             700,
      'text-background-color':   '#06101E',
      'text-border-color':       '#1D4ED8',
      'shadow-blur':             18,
      'shadow-color':            '#3B82F6',
      'shadow-opacity':          0.95
    }
  },
  {
    selector: 'node.highlighted, node:selected, node.hovered-focus',
    style: {
      'border-width':             4.0,
      'border-color':             '#3B82F6',
      'shadow-blur':              28,
      'shadow-color':             '#3B82F6',
      'shadow-opacity':           0.95,
      'opacity':                  1.0,
      'z-index':                  30,
      'background-width':         '26px',
      'background-height':        '26px',
      'background-image-opacity': 1.0
    }
  },
  {
    selector: 'edge.highlighted, edge.hovered-focus',
    style: {
      'width':             3.5,
      'line-color':        '#3B82F6',
      'target-arrow-color':'#3B82F6',
      'opacity':           1.0,
      'z-index':           25
    }
  },
  {
    selector: 'node.dimmed',
    style: { 'opacity': 0.15, 'shadow-opacity': 0, 'background-image-opacity': 0.2 }
  },
  {
    selector: 'edge.dimmed',
    style: { 'opacity': 0.08, 'shadow-opacity': 0 }
  }
];
```

---

## 6. Layout Initialization & Dagre Hook

In `GraphCanvas.jsx`:

```javascript
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

export const runLayout = (cy, animate = false) => {
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
};
```

---

## 7. QA Verification Checklist

1. **Node Micro-Glyph**: Verify icon is ~12px inside 58px node with ~23px breathing room on all sides.
2. **Left-to-Right Hierarchy**: Victim accounts anchor on the left (`Layer 0`), Mules in center (`Layer 1`), and Cashouts/Merchants on right (`Layer 2+`).
3. **Continuous Animation**: Dashed red edges visibly move forward via RAF dash offset.
4. **Node Tap Event**: Clicking any node dims unrelated elements to `0.15` and opens the Entity Inspector with Inflow/Outflow analytics.
5. **Timeline Sync**: Clicking any of the 7 stages spotlights the corresponding hop in the network.
