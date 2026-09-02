# SENTINEL Graph Architecture Specification

## 1. High-Level Architectural Pipeline

The SENTINEL investigation graph operates on a unidirectional reactive pipeline spanning backend ingestion, WebSocket broadcast, topology synthesis, DAG layout compilation, and HTML5 Canvas GPU-accelerated rendering.

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI / Python)                │
│  - Raw Transaction Stream Ingestion (Txn Simulator / Live)  │
│  - Hybrid Rule Engine + IsolationForest / XGBoost ML Model  │
│  - Case Synthesis & Golden-Window Calculation               │
└──────────────────────────────┬──────────────────────────────┘
                               │ WebSocket (/ws) & REST (/cases)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND STATE (useWebSocket)                │
│  - Normalized Cases Array [{ case_id, nodes, edges, ... }]  │
│  - Active Real-Time Dispatch into Page Router               │
└──────────────────────────────┬──────────────────────────────┘
                               │ React Props (caseData, actions)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             TOPOLOGY ENGINE (topologyEngine.js)             │
│  - Deterministic Case ID Hashing & Flag Pattern Matching   │
│  - 6 Forensic Archetypes (Fan-Out, Linear, Fan-In, etc.)   │
│  - Layer / Hop Index Assignment & Label Generation          │
└──────────────────────────────┬──────────────────────────────┘
                               │ { nodes, edges, label, archetype }
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                CYTOSCAPE.JS CORE ENGINE                     │
│  - Graph Canvas Mount & Lifecycle Management                │
│  - cytoscape-dagre Directed Acyclic Graph (DAG) Layout       │
│  - High-DPI Radial Gradient & Inline SVG Glyph Renderer     │
│  - Continuous Flow Dash Loop & Breathing Aura RAF Engine     │
└──────────────┬──────────────────────────────┬───────────────┘
               │ Tap / Hover Events           │ Hop Tracing / Step
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   RIGHT INSPECTOR PANEL      │ │   TIMELINE / SCRUBBER      │
│ - Forensic Intel Synthesis   │ │ - 7-Stage Pipeline Playback│
│ - Entity Inspector           │ │ - Hop Isolation & Dimming  │
│ - Execution & Freeze Guards  │ │ - Autonomous Sync Loop     │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 2. Stage-by-Stage Breakdown

### Stage 1: Data Ingestion & Case Normalization
- **Backend API (`backend/main.py`)**: Publishes cases with nodes (`account_id`, `status`, `balance`) and edges (`source`, `target`, `amount`, `channel`, `timestamp`, `is_suspicious`).
- **Client Ingestion (`frontend/src/hooks/useWebSocket.js`)**: Listens to `ws://127.0.0.1:8000/ws` with heartbeat auto-reconnect (5s backoff). Normalizes incoming events into `cases` state.

### Stage 2: Forensic Topology Synthesis (`topologyEngine.js`)
- If backend provides >= 4 nodes and >= 3 edges, topology is preserved and enriched.
- Otherwise, a deterministic Murmur-style hash classifies the case into one of 6 financial-crime archetypes:
  1. `FAN_OUT`: Wide 1-to-N mule dispersion.
  2. `LINEAR_CHAIN`: Deep sequential multi-hop layering.
  3. `FAN_IN`: Multi-source aggregator pooling into collector.
  4. `CIRCULAR_LOOP`: Round-trip wash cycling.
  5. `STRUCTURING_PASS_THROUGH`: Split into UPI micro-channels to merchants.
  6. `DIRECT_CASHOUT`: Direct rapid exit to ATM terminal.

### Stage 3: Cytoscape Graph Instantiation (`GraphCanvas.jsx`)
- Canvas container attached to React `useRef(null)`.
- Instantiated with `cytoscape({ container, elements, style: graphStyles, minZoom: 0.2, maxZoom: 4.0 })`.
- Layout executed via `cytoscape-dagre` in `LR` (Left-to-Right) hierarchical orientation.

### Stage 4: Continuous Rendering & Animation Engine
- Continuous `requestAnimationFrame` loop drives edge dash-offset animation (`line-dash-offset` step: `0.5px/frame`) for real-time money flow visualization.
- Critical nodes execute a sine-wave breathing aura (`18px + Math.sin(t) * 8px` blur).

### Stage 5: Interaction & Inspection Bus
- Tapping any node dispatches node metadata to parent `GraphModule.jsx` via `onNodeClick`.
- Automatically toggles the Right Action Panel into **Forensic Entity Inspector** mode.
- Neighborhood highlighting isolates immediate upstream/downstream flows while dimming non-participating nodes to `opacity: 0.15`.
