# SENTINEL Graph Data Model Specification

## 1. Case Object Interface

```typescript
interface SentinelCase {
  case_id: string;                    // e.g. "CASE-3DFF494F"
  status: 'active' | 'flagged' | 'closed' | 'actioned';
  risk_level: number;                 // e.g. 94 or 100
  total_fraud_amount: number;         // e.g. 82301.13
  recovered_amount: number;           // e.g. 0.0
  recoverable_amount: number;         // e.g. 82301.13
  golden_window_minutes: number;      // e.g. 20
  primary_tx_id?: string;             // e.g. "TX-171F56F3"
  risk_factors?: Array<{ name: string; score: number } | string>;
  nodes: Array<{
    id: string;
    accountId?: string;
    account_id?: string;
    status: string;
    type?: string;
    balance?: number;
    layer?: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    amount: number;
    channel?: string;
    timestamp?: string;
    time?: string;
    is_suspicious?: boolean;
  }>;
  actionLog?: Array<{
    id: string;
    type: string;
    target: string;
    status: string;
    timestamp: string;
  }>;
}
```

---

## 2. Dynamic Node Type Classification

If `type` is not explicitly provided on a node, `inferNodeType` in `topologyEngine.js` resolves it deterministically via substring patterns:

```javascript
const inferNodeType = (id = '', index = 0, total = 2) => {
  const u = id.toUpperCase();
  if (u.includes('VICTIM') || index === 0) return 'victim';
  if (u.includes('MULE')) return 'mule';
  if (u.includes('MERCH') || u.includes('STORE')) return 'merchant';
  if (u.includes('@') || u.includes('UPI')) return 'upi';
  if (u.includes('CASH') || u.includes('ATM') || u.includes('EXIT') || index === total - 1) return 'cashout';
  if (u.includes('CRYPTO') || u.includes('DESK')) return 'crypto';
  if (u.includes('COLLECTOR') || u.includes('HUB')) return 'collector';
  return 'mule';
};
```
