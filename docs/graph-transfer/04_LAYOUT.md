# SENTINEL Graph Layout Engine Specification

## 1. Engine & Algorithm

SENTINEL uses the **`cytoscape-dagre`** plugin, a specialized port of the Dagre directed acyclic graph layout engine.

- **Package**: `cytoscape-dagre` (`v4.0.1`)
- **Underlying Layout**: Hierarchical Rank-Based Layering (Sugiyama method / Network Simplex)
- **Orientation**: Left-to-Right (`LR`)

---

## 2. Exact Layout Configuration

Implemented in `GraphCanvas.jsx` (`runLayout` callback):

```javascript
cy.layout({
  name: 'dagre',
  rankDir: 'LR',              // Flow from left (Victim) to right (Mules/Cashout)
  nodeSep: 65,                // Horizontal separation between adjacent sibling nodes
  rankSep: 145,               // Vertical/Layer separation between sequential hops
  edgeSep: 20,                // Separation between parallel edges
  ranker: 'network-simplex',  // Optimal rank assignment algorithm
  animate: animate,           // Smooth layout transition on reset/mount
  animationDuration: 400,     // 400ms transition
  animationEasing: 'ease-out',
  padding: 45,                // Viewport boundary margin in pixels
  fit: true                   // Automatically zoom & center graph within container
}).run();
```

---

## 3. Layer / Hop Assignment System

The `topologyEngine.js` guarantees that every node is tagged with a deterministic `layer` integer (`0, 1, 2, ...`).

- **Layer 0**: Feeder / Source Victim accounts.
- **Layer 1**: Primary Mule Intermediaries or Aggregator Hubs.
- **Layer 2**: Secondary Layering accounts, UPI Splits, or Cashout Terminals.
- **Layer 3+**: Downstream Merchant POS or Offshore Crypto Exits.

This enforces a strictly ordered topological flow from left to right across all 6 financial crime archetypes.
