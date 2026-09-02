# HOW TO RECREATE THIS EXACT GRAPH IN ANOTHER SENTINEL PROJECT

Follow these step-by-step engineering instructions to clone this exact investigation graph workspace into a target React application.

---

### Step 1: Install Dependencies
```bash
npm install cytoscape cytoscape-dagre lucide-react clsx tailwind-merge
```

### Step 2: Create Forensic Topology Engine
Create `src/utils/topologyEngine.js` with the 6 crime archetypes (`FAN_OUT`, `LINEAR_CHAIN`, `FAN_IN`, `CIRCULAR_LOOP`, `STRUCTURING_PASS_THROUGH`, `DIRECT_CASHOUT`) and the `deriveCaseTopology(rawNodes, rawEdges, caseData)` algorithm.

### Step 3: Create Graph Stylesheet
Create `src/modules/GraphModule/graphStyles.js`.
- Define `makeSvgUri` helper with `encodeURIComponent` and `viewBox="-12 -12 48 48"` (50% scale micro-glyphs).
- Define `SVG_ICONS` for `victim`, `mule`, `merchant`, `upi`, `cashout`, `crypto`, `collector`, `individual`.
- Define `NODE_CONFIG` for sizes, colors, and geometries.
- Define Cytoscape style array with 3D radial gradient fills, smooth bezier curves, and suspicious animated dashes.

### Step 4: Create GraphCanvas Component
Create `src/modules/GraphModule/GraphCanvas.jsx`:
- Import `cytoscape` and register `cytoscape.use(dagre)`.
- Initialize Cytoscape inside `useEffect` on `containerRef.current`.
- Mount `runLayout(cy)` using `name: 'dagre', rankDir: 'LR', nodeSep: 65, rankSep: 145`.
- Mount continuous RAF loop for `.suspicious-edge` dash animation.
- Wire `useImperativeHandle` for `traceSuspiciousPath()`, `highlightNode()`, `highlightHop()`, and `fit()`.
- Add floating HUD (`ZoomIn`, `ZoomOut`, `Maximize2`, `RefreshCw`, `Trace Path`).
- Add embedded SVG picture-in-picture `Minimap` in bottom-right.

### Step 5: Create Timeline Scrubber
Create `src/modules/GraphModule/TimelineScrubber.jsx`:
- Implement 7-stage autonomous investigation stepper (`Txn Ingestion` to `Action Formulated`).
- Implement Auto-Play interval loop and bidirectional step scrubbing synchronized with `highlightHop`.

### Step 6: Create Right Action / Intelligence Panel
Create `src/modules/GraphModule/ActionPanel.jsx`:
- Dual-mode router: Overview (Explainable AI cards, confidence score, threat breakdown) vs Entity Inspector (Inbound/Outbound volume, velocity, freeze action buttons).

### Step 7: Assemble Master Workstation Grid
Create `src/modules/GraphModule/GraphModule.jsx`:
- Place `CaseBanner` across top.
- Place Left Graph Canvas + Bottom Timeline Scrubber (`~68%` width).
- Place Right Recovery Bar + Action Panel + Ask Sentinel Bar (`~32%` width).

### Step 8: Verification & QA
- Build with `npm run build`.
- Verify node icon glyphs are rendered at **~12px** with **~23px breathing room**.
- Verify Left-to-Right DAG hierarchy.
