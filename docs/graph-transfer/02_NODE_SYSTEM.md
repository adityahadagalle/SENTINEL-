# SENTINEL Node System Specification

## 1. Node Data Model

Every node in the Cytoscape graph holds the following structured payload within `node.data()`:

```typescript
interface SentinelNodeData {
  id: string;              // Unique account or entity ID (e.g. 'ACC-VICTIM-4731', 'ACC-MUL-6109')
  displayLabel: string;    // Role-dependent masked/unmasked label (Admin: full ID, Analyst: masked)
  status: 'active' | 'flagged' | 'frozen' | 'withdrawn' | 'victim';
  type: 'victim' | 'mule' | 'merchant' | 'upi' | 'cashout' | 'crypto' | 'collector' | 'individual';
  layer: number;           // Topological hop depth (0 for source victim, 1+ for downstream hops)
  balance?: number;        // Account balance in INR
  inflow?: string;         // Calculated inbound volume string (e.g. '₹80,852')
  outflow?: string;        // Calculated outbound volume string (e.g. '₹79,235')
  risk_score?: number;     // Entity risk score (0–100)
}
```

---

## 2. Geometry, Color & Material Configuration (`NODE_CONFIG`)

Defined in [`frontend/src/modules/GraphModule/graphStyles.js`](file:///frontend/src/modules/GraphModule/graphStyles.js):

| Entity Type | Shape | Base Background | Radial Inner Glow | Border Color | Border Width | Size |
|---|---|---|---|---|---|---|
| **`victim`** | `ellipse` | `#0A1838` (Deep Blue) | `#1E3A8A` | `#3B82F6` (Electric Blue) | `2.5px` | `58px` |
| **`mule`** | `polygon` (Octagon) | `#380707` (Deep Crimson) | `#7F1D1D` | `#EF4444` (Vibrant Red) | `3.0px` | `60px` |
| **`merchant`**| `round-rectangle`| `#022417` (Deep Emerald)| `#065F46` | `#10B981` (Emerald) | `2.5px` | `56px` |
| **`upi`** | `diamond` | `#200C44` (Deep Purple) | `#4C1D95` | `#8B5CF6` (Violet) | `2.5px` | `58px` |
| **`cashout`** | `polygon` (Octagon) | `#361600` (Deep Amber) | `#78350F` | `#F59E0B` (Amber) | `2.5px` | `58px` |
| **`crypto`** | `polygon` (Hexagon) | `#03232C` (Deep Cyan) | `#155E75` | `#06B6D4` (Cyan) | `2.5px` | `58px` |
| **`collector`**| `round-rectangle`| `#331505` (Deep Orange) | `#7C2D12` | `#F97316` (Orange) | `3.0px` | `62px` |
| **`individual`**| `ellipse` | `#0F172A` (Slate Dark) | `#1E293B` | `#475569` (Slate) | `2.0px` | `50px` |

---

## 3. Polygon Coordinate Sets

To achieve true geometric octagons and hexagons in Cytoscape:

```javascript
// 8-sided Octagon Points
const OCTAGON_POINTS = [
  -0.383, -0.924,   0.383, -0.924,
   0.924, -0.383,   0.924,  0.383,
   0.383,  0.924,  -0.383,  0.924,
  -0.924,  0.383,  -0.924, -0.383
];

// 6-sided Hexagon Points
const HEXAGON_POINTS = [
  0, -1,
  0.866, -0.5,
  0.866,  0.5,
  0,  1,
 -0.866,  0.5,
 -0.866, -0.5
];
```

---

## 4. Visual Shading & Radial Lighting

Cytoscape renders pseudo-3D sphere/gem center lighting via:

```javascript
'background-fill': 'radial-gradient',
'background-gradient-stop-colors': (n) => {
  const t = getNodeType(n);
  const c = NODE_CONFIG[t] || NODE_CONFIG.mule;
  return `${c.innerGlow} ${c.bg}`;
},
'background-gradient-stop-positions': '0% 100%',
```

---

## 5. Label Backdrop Pills

Labels sit below the node with high-contrast semi-transparent backdrop capsules:

```javascript
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
'text-wrap':               'ellipsis'
```
