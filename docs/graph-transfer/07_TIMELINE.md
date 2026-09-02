# SENTINEL Autonomous Investigation Timeline & Pipeline Stepper

## 1. 7-Stage Pipeline Model

The bottom timeline is structured as an interactive 7-stage autonomous investigation stepper:

| Stage # | Stage Title | Stage Description | Stage Icon | Color |
|---|---|---|---|---|
| **01** | `Txn Ingestion` | Ingested primary clearing event | `Zap` | `#3B82F6` |
| **02** | `Anomaly Flagged` | High-velocity threshold burst | `AlertTriangle` | `#F59E0B` |
| **03** | `Network Expansion`| Mapped 3-hop mule perimeter | `Network` | `#3B82F6` |
| **04** | `Entity Enrichment`| KYC & Device telemetry linked | `ShieldCheck` | `#60A5FA` |
| **05** | `Pattern Classified`| Structuring Pass-Through signature| `Sparkles` | `#8B5CF6` |
| **06** | `Risk Assessed` | 100 Critical Risk confirmed | `AlertTriangle` | `#EF4444` |
| **07** | `Action Formulated`| Freeze & SAR recommendation ready | `CheckCircle2` | `#10B981` |

---

## 2. Synchronization with Cytoscape Canvas

When a stage is selected or auto-played:
1. `onTimeChange(index)` is invoked in `TimelineScrubber.jsx`.
2. `GraphModule.jsx` updates `timelineIndex` and calls `canvasRef.current?.highlightHop(index)`.
3. `GraphCanvas.jsx` highlights the edge and nodes corresponding to that hop index:

```javascript
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
}
```

---

## 3. Auto-Play Mode

- Triggered by the `AUTO PLAY` toggle button in the stepper header.
- Uses `setInterval` with a `1400ms` tick interval to step through stages `01` to `07` in a continuous loop.
