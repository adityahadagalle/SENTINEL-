# SENTINEL Explainable AI & Intelligence Panel Integration

## 1. Data Flow Architecture

```
[ Cytoscape Canvas ]
       │ Node Tap / Selection Event
       ▼
[ GraphModule State (selectedNode) ]
       │ Props
       ▼
[ ActionPanel (Dual-Mode Router) ]
 ├── [ If selectedNode === null ] → Mode A: Forensic Intelligence Overview
 └── [ If selectedNode !== null ] → Mode B: Dedicated Entity Inspector
```

---

## 2. Mode A: Forensic Intelligence Overview

Contains 4 core investigative modules:
1. **Model Confidence & Synthesis**:
   - Model Confidence Score: `94%` (Animated count-up).
   - Synthesis Paragraph summarizing pattern classification.
2. **Threat Breakdown Radar/Meters**:
   - Layering Dispersion (`92%`)
   - Mule Cascade Probability (`98%`)
   - Fund Velocity Signature (`70%`)
3. **"Why SENTINEL Thinks This" Explainable Reasons**:
   - 4 interactive reason cards.
   - Clicking any card triggers `onEvidenceClick(hopIdx)`, which immediately spotlights that hop in the Cytoscape canvas (`canvasRef.current.highlightHop(hopIdx)`).
4. **Autonomous Copilot & Decision Support**:
   - Autonomous freeze recommendation banner.
   - 1-Click Enforcement action: `[ Freeze Mule Network ]`.

---

## 3. Mode B: Dedicated Entity Inspector

Automatically opens when a user clicks on any node:
- Displays **Account ID**, **Assessed Risk Score Badge**, and **Role / Type**.
- Real-time **Inbound Volume (`₹80,852`)** & **Outbound Volume (`₹79,235`)**.
- **Velocity Signature**: `HIGH-FREQUENCY BURST`.
- **Connected Entities Counter**: Flagged Mule Accounts (`3 Accounts`), Beneficiary Nodes (`1 Account`).
- **Enforcement Actions**:
  - `[ Freeze Account ]` (`/action/freeze`)
  - `[ Flag for Telecom & KYC Audit ]` (`/action/flag`)
  - `[ Escalate to Law Enforcement (LEA) ]` (`/action/alert`)
