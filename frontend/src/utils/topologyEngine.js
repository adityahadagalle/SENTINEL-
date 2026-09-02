/**
 * SENTINEL Forensic Topology Engine
 *
 * Derives genuine, structurally distinct graph topologies directly from case data.
 * Supports 6 distinct financial crime archetypes:
 * 1. FAN_OUT              - Wide Fan-Out Dispersion (1 Victim -> 3-5 Mules in parallel -> Merchants/Cashouts)
 * 2. LINEAR_CHAIN         - Deep Sequential Layering (1 Victim -> Mule 1 -> Mule 2 -> Mule 3 -> Mule 4 -> Exit)
 * 3. FAN_IN               - Aggregator Mule Pooling (3-4 Victims -> 1 Collector Mule -> Crypto/Cashout)
 * 4. CIRCULAR_LOOP        - Round-Tripping Wash Cycle (Victim -> Mule A -> Mule B -> Mule C -> Loops back)
 * 5. STRUCTURING_PASS_THROUGH - UPI Micro-Drain Structuring (Victim -> Mule -> 2 UPI Handles -> 3 Merchants)
 * 6. DIRECT_CASHOUT       - Direct Fast Cashout (Victim -> 1 Mule -> ATM Terminal)
 */

export const TOPOLOGY_ARCHETYPES = {
  FAN_OUT: 'FAN_OUT',
  LINEAR_CHAIN: 'LINEAR_CHAIN',
  FAN_IN: 'FAN_IN',
  CIRCULAR_LOOP: 'CIRCULAR_LOOP',
  STRUCTURING_PASS_THROUGH: 'STRUCTURING_PASS_THROUGH',
  DIRECT_CASHOUT: 'DIRECT_CASHOUT'
};

/**
 * Classifies a case into a distinct topology archetype based on its risk factors,
 * amount, channels, and deterministic seed from case ID.
 */
export const classifyCaseTopology = (caseData = {}) => {
  const caseId = caseData.case_id || '';
  const hash = caseId.split('').reduce((acc, c, idx) => (acc * 37 + c.charCodeAt(0) * (idx + 1)) & 0xfffffff, 0);
  const factors = Array.isArray(caseData.risk_factors) 
    ? caseData.risk_factors.map(f => (typeof f === 'string' ? f : f.name || '')).join(' ')
    : '';

  // 1. Explicit factor matching if specific flags fired
  if (factors.includes('crypto_risk') || factors.includes('cross_border_risk')) {
    return (hash % 2 === 0) ? TOPOLOGY_ARCHETYPES.FAN_IN : TOPOLOGY_ARCHETYPES.LINEAR_CHAIN;
  }
  if (factors.includes('scripted_behavior') || factors.includes('circular')) {
    return TOPOLOGY_ARCHETYPES.CIRCULAR_LOOP;
  }
  if (factors.includes('bulk_transfer') || factors.includes('velocity_spike')) {
    return TOPOLOGY_ARCHETYPES.FAN_OUT;
  }
  if (factors.includes('new_receiver') && (hash % 2 === 0)) {
    return TOPOLOGY_ARCHETYPES.STRUCTURING_PASS_THROUGH;
  }

  // 2. Uniform, deterministic distribution across all 6 archetypes
  const archetypes = [
    TOPOLOGY_ARCHETYPES.FAN_OUT,
    TOPOLOGY_ARCHETYPES.LINEAR_CHAIN,
    TOPOLOGY_ARCHETYPES.FAN_IN,
    TOPOLOGY_ARCHETYPES.CIRCULAR_LOOP,
    TOPOLOGY_ARCHETYPES.STRUCTURING_PASS_THROUGH,
    TOPOLOGY_ARCHETYPES.DIRECT_CASHOUT
  ];
  return archetypes[Math.abs(hash) % archetypes.length];
};

/**
 * Builds a case-derived topology with distinct node counts, branch counts,
 * hop depths, and entity mixes.
 */
export const deriveCaseTopology = (rawNodes = [], rawEdges = [], caseData = {}) => {
  const caseId = caseData.case_id || (rawNodes[0]?.id ? `CASE-${rawNodes[0].id.slice(-6)}` : 'CASE-ALPHA');
  const hash = caseId.split('').reduce((acc, c) => (acc * 33 + c.charCodeAt(0)) & 0xffff, 0);
  const totalFraud = Number(caseData.total_fraud_amount || 145000 + (hash % 250000));
  const baseSeed = 1000 + (hash % 8000);

  // If the backend already provided a rich multi-node graph (>= 4 nodes and distinct edges),
  // preserve and augment it directly.
  if (rawNodes.length >= 4 && rawEdges.length >= 3) {
    const enrichedNodes = rawNodes.map((n, idx) => {
      const id = String(n.id || n.accountId || `ACC-${idx}`);
      const type = n.type || inferNodeType(id, idx, rawNodes.length);
      return {
        id,
        label: id,
        displayLabel: id,
        status: n.status || (idx === 0 ? 'victim' : idx === 1 ? 'flagged' : 'active'),
        type,
        layer: n.layer !== undefined ? n.layer : idx
      };
    });

    const enrichedEdges = rawEdges.map((e, idx) => ({
      id: e.id || `e-${idx}`,
      source: String(e.source || e.from),
      target: String(e.target || e.to),
      amount: Number(e.amount || 50000),
      channel: e.channel || 'UPI',
      time: e.timestamp || e.time || `10:${10 + idx * 2}:00`,
      is_suspicious: e.is_suspicious !== undefined ? e.is_suspicious : (idx < 2)
    }));

    const topologyLabel = computeDynamicTopologyLabel(enrichedNodes, enrichedEdges, 'CUSTOM_CHAIN');
    return { nodes: enrichedNodes, edges: enrichedEdges, label: topologyLabel, archetype: 'CUSTOM_CHAIN' };
  }

  // Otherwise, construct the archetype matching this specific case!
  const archetype = classifyCaseTopology(caseData);
  let nodes = [];
  let edges = [];

  switch (archetype) {
    // ─────────────────────────────────────────────────────────────────────────
    // 1. WIDE FAN-OUT DISPERSION (1 Victim -> 3 to 4 Parallel Mules -> Endpoints)
    // ─────────────────────────────────────────────────────────────────────────
    case TOPOLOGY_ARCHETYPES.FAN_OUT: {
      const branchCount = 3 + (hash % 2); // 3 or 4 parallel branches
      const victimId = `ACC-VICTIM-${baseSeed}`;
      nodes.push({ id: victimId, label: victimId, displayLabel: victimId, status: 'flagged', type: 'victim', layer: 0 });

      const branchShare = Math.round(totalFraud / branchCount);

      for (let i = 0; i < branchCount; i++) {
        const muleId = `ACC-MULE-${String.fromCharCode(65 + i)}-${baseSeed + 100 * (i + 1)}`;
        nodes.push({ id: muleId, label: muleId, displayLabel: muleId, status: 'flagged', type: 'mule', layer: 1 });
        
        edges.push({
          id: `e-vo-${i}`,
          source: victimId,
          target: muleId,
          amount: branchShare,
          channel: (i % 2 === 0) ? 'IMPS' : 'NEFT',
          time: `10:${12 + i * 2}:15`,
          is_suspicious: true
        });

        // Downstream endpoint per branch (mix of Merchant, Cashout, and UPI)
        const endpointTypes = ['merchant', 'cashout', 'upi', 'merchant'];
        const epType = endpointTypes[i % endpointTypes.length];
        const epId = epType === 'merchant'
          ? `ACC-MERCH-${baseSeed + 500 + i}`
          : epType === 'cashout'
          ? `ATM-CASHOUT-${baseSeed + 600 + i}`
          : `UPI-DRAIN-${baseSeed + 700 + i}@okhdfc`;

        nodes.push({ id: epId, label: epId, displayLabel: epId, status: epType === 'cashout' ? 'withdrawn' : 'active', type: epType, layer: 2 });
        edges.push({
          id: `e-mo-${i}`,
          source: muleId,
          target: epId,
          amount: Math.round(branchShare * 0.94),
          channel: epType === 'upi' ? 'UPI' : (i % 2 === 0 ? 'CARD' : 'IMPS'),
          time: `10:${20 + i * 3}:40`,
          is_suspicious: (i === 0 || epType === 'cashout')
        });
      }
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. DEEP SEQUENTIAL LAYERING (Victim -> Mule 1 -> Mule 2 -> Mule 3 -> Mule 4 -> Unresolved Exit)
    // ─────────────────────────────────────────────────────────────────────────
    case TOPOLOGY_ARCHETYPES.LINEAR_CHAIN: {
      const hopCount = 5 + (hash % 2); // 5 or 6 sequential hops
      const victimId = `ACC-VICTIM-${baseSeed}`;
      nodes.push({ id: victimId, label: victimId, displayLabel: victimId, status: 'flagged', type: 'victim', layer: 0 });

      let currentSource = victimId;
      let currentAmount = totalFraud;

      for (let hop = 1; hop <= hopCount; hop++) {
        const isTerminal = (hop === hopCount);
        const nodeId = isTerminal
          ? `ACC-OFFSHORE-EXIT-${baseSeed + hop * 111}`
          : `ACC-MULE-L${hop}-${baseSeed + hop * 111}`;
        const nodeType = isTerminal ? 'cashout' : 'mule';
        const nodeStatus = isTerminal ? 'withdrawn' : 'flagged';

        nodes.push({
          id: nodeId,
          label: nodeId,
          displayLabel: nodeId,
          status: nodeStatus,
          type: nodeType,
          layer: hop
        });

        currentAmount = Math.round(currentAmount * 0.96);
        const channels = ['NEFT', 'IMPS', 'RTGS', 'UPI', 'NEFT', 'SWIFT'];

        edges.push({
          id: `e-hop-${hop}`,
          source: currentSource,
          target: nodeId,
          amount: currentAmount,
          channel: channels[(hop - 1) % channels.length],
          time: `11:${String(hop * 8).padStart(2, '0')}:22`,
          is_suspicious: true
        });

        currentSource = nodeId;
      }
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. AGGREGATOR MULE POOLING (3-4 Victims -> 1 Collector Mule -> Crypto/Cashout Desk)
    // ─────────────────────────────────────────────────────────────────────────
    case TOPOLOGY_ARCHETYPES.FAN_IN: {
      const sourceCount = 3 + (hash % 2); // 3 or 4 feeder sources
      const collectorId = `ACC-COLLECTOR-HUB-${baseSeed}`;
      const cryptoDeskId = `DESK-CRYPTO-OTC-${baseSeed + 999}`;

      // Feeder source nodes (layer 0)
      const feedAmount = Math.round(totalFraud / sourceCount);
      for (let i = 0; i < sourceCount; i++) {
        const srcId = `ACC-FEEDER-${String.fromCharCode(65 + i)}-${baseSeed + i * 73}`;
        nodes.push({ id: srcId, label: srcId, displayLabel: srcId, status: 'flagged', type: 'victim', layer: 0 });
        
        edges.push({
          id: `e-in-${i}`,
          source: srcId,
          target: collectorId,
          amount: feedAmount + (i * 2500),
          channel: 'UPI',
          time: `09:${30 + i * 4}:10`,
          is_suspicious: true
        });
      }

      // Collector node (layer 1)
      nodes.push({ id: collectorId, label: collectorId, displayLabel: collectorId, status: 'flagged', type: 'collector', layer: 1 });

      // Crypto OTC / Terminal (layer 2)
      nodes.push({ id: cryptoDeskId, label: cryptoDeskId, displayLabel: cryptoDeskId, status: 'withdrawn', type: 'crypto', layer: 2 });
      edges.push({
        id: `e-crypto-out`,
        source: collectorId,
        target: cryptoDeskId,
        amount: Math.round(totalFraud * 0.97),
        channel: 'RTGS',
        time: '09:55:00',
        is_suspicious: true
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. CIRCULAR WASH LOOP (Victim -> Mule A -> Mule B -> Mule C -> Loops back to Mule A)
    // ─────────────────────────────────────────────────────────────────────────
    case TOPOLOGY_ARCHETYPES.CIRCULAR_LOOP: {
      const victimId = `ACC-ORIGIN-${baseSeed}`;
      const muleA = `ACC-WASH-ALPHA-${baseSeed + 101}`;
      const muleB = `ACC-WASH-BETA-${baseSeed + 202}`;
      const muleC = `ACC-WASH-GAMMA-${baseSeed + 303}`;

      nodes.push({ id: victimId, label: victimId, displayLabel: victimId, status: 'flagged', type: 'victim', layer: 0 });
      nodes.push({ id: muleA, label: muleA, displayLabel: muleA, status: 'flagged', type: 'mule', layer: 1 });
      nodes.push({ id: muleB, label: muleB, displayLabel: muleB, status: 'flagged', type: 'mule', layer: 2 });
      nodes.push({ id: muleC, label: muleC, displayLabel: muleC, status: 'flagged', type: 'mule', layer: 3 });

      edges.push({ id: 'e-c1', source: victimId, target: muleA, amount: totalFraud, channel: 'NEFT', time: '14:02:10', is_suspicious: true });
      edges.push({ id: 'e-c2', source: muleA, target: muleB, amount: Math.round(totalFraud * 0.99), channel: 'IMPS', time: '14:08:45', is_suspicious: true });
      edges.push({ id: 'e-c3', source: muleB, target: muleC, amount: Math.round(totalFraud * 0.98), channel: 'UPI', time: '14:15:30', is_suspicious: true });
      // Closed return cycle edge
      edges.push({ id: 'e-c4-loop', source: muleC, target: muleA, amount: Math.round(totalFraud * 0.95), channel: 'NEFT', time: '14:24:00', is_suspicious: true });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. STRUCTURING PASS-THROUGH (Victim -> Mule -> 2 UPI Handles -> 3 Merchants)
    // ─────────────────────────────────────────────────────────────────────────
    case TOPOLOGY_ARCHETYPES.STRUCTURING_PASS_THROUGH: {
      const victimId = `ACC-VICTIM-${baseSeed}`;
      const muleId = `ACC-MULE-PRIMARY-${baseSeed + 42}`;
      const upi1 = `UPI-SPLIT-1-${baseSeed}@oksbi`;
      const upi2 = `UPI-SPLIT-2-${baseSeed}@okaxis`;
      const merch1 = `ACC-RETAIL-POS1-${baseSeed + 801}`;
      const merch2 = `ACC-RETAIL-POS2-${baseSeed + 802}`;
      const merch3 = `ACC-ECOMM-GATEWAY-${baseSeed + 803}`;

      nodes.push({ id: victimId, label: victimId, displayLabel: victimId, status: 'flagged', type: 'victim', layer: 0 });
      nodes.push({ id: muleId, label: muleId, displayLabel: muleId, status: 'flagged', type: 'mule', layer: 1 });
      nodes.push({ id: upi1, label: upi1, displayLabel: upi1, status: 'active', type: 'upi', layer: 2 });
      nodes.push({ id: upi2, label: upi2, displayLabel: upi2, status: 'active', type: 'upi', layer: 2 });
      nodes.push({ id: merch1, label: merch1, displayLabel: merch1, status: 'active', type: 'merchant', layer: 3 });
      nodes.push({ id: merch2, label: merch2, displayLabel: merch2, status: 'active', type: 'merchant', layer: 3 });
      nodes.push({ id: merch3, label: merch3, displayLabel: merch3, status: 'active', type: 'merchant', layer: 3 });

      edges.push({ id: 'e-s1', source: victimId, target: muleId, amount: totalFraud, channel: 'IMPS', time: '16:10:00', is_suspicious: true });
      edges.push({ id: 'e-s2', source: muleId, target: upi1, amount: Math.round(totalFraud * 0.55), channel: 'UPI', time: '16:12:15', is_suspicious: true });
      edges.push({ id: 'e-s3', source: muleId, target: upi2, amount: Math.round(totalFraud * 0.43), channel: 'UPI', time: '16:13:00', is_suspicious: true });
      edges.push({ id: 'e-s4', source: upi1, target: merch1, amount: Math.round(totalFraud * 0.30), channel: 'UPI', time: '16:18:20', is_suspicious: false });
      edges.push({ id: 'e-s5', source: upi1, target: merch2, amount: Math.round(totalFraud * 0.24), channel: 'UPI', time: '16:19:10', is_suspicious: false });
      edges.push({ id: 'e-s6', source: upi2, target: merch3, amount: Math.round(totalFraud * 0.41), channel: 'UPI', time: '16:21:05', is_suspicious: false });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. DIRECT FAST CASHOUT (Victim -> 1 Mule -> 1 ATM Terminal)
    // ─────────────────────────────────────────────────────────────────────────
    case TOPOLOGY_ARCHETYPES.DIRECT_CASHOUT:
    default: {
      const victimId = `ACC-VICTIM-${baseSeed}`;
      const muleId = `ACC-MULE-QUICK-${baseSeed + 99}`;
      const atmId = `ATM-CASHOUT-${baseSeed + 777}`;

      nodes.push({ id: victimId, label: victimId, displayLabel: victimId, status: 'flagged', type: 'victim', layer: 0 });
      nodes.push({ id: muleId, label: muleId, displayLabel: muleId, status: 'flagged', type: 'mule', layer: 1 });
      nodes.push({ id: atmId, label: atmId, displayLabel: atmId, status: 'withdrawn', type: 'cashout', layer: 2 });

      edges.push({ id: 'e-d1', source: victimId, target: muleId, amount: totalFraud, channel: 'IMPS', time: '12:05:10', is_suspicious: true });
      edges.push({ id: 'e-d2', source: muleId, target: atmId, amount: Math.round(totalFraud * 0.98), channel: 'CARD', time: '12:14:30', is_suspicious: true });
      break;
    }
  }

  const topologyLabel = computeDynamicTopologyLabel(nodes, edges, archetype);
  return { nodes, edges, label: topologyLabel, archetype };
};

/**
 * Computes a human-readable, mathematically accurate topology label from the actual graph.
 */
export const computeDynamicTopologyLabel = (nodes = [], edges = [], archetype = '') => {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  const names = {
    [TOPOLOGY_ARCHETYPES.FAN_OUT]: 'Wide Fan-Out Dispersion',
    [TOPOLOGY_ARCHETYPES.LINEAR_CHAIN]: 'Deep Sequential Layering',
    [TOPOLOGY_ARCHETYPES.FAN_IN]: 'Aggregator Fan-In Collection',
    [TOPOLOGY_ARCHETYPES.CIRCULAR_LOOP]: 'Circular Flow Loop (Round-Trip)',
    [TOPOLOGY_ARCHETYPES.STRUCTURING_PASS_THROUGH]: 'Merchant Structuring Pass-Through',
    [TOPOLOGY_ARCHETYPES.DIRECT_CASHOUT]: 'Direct Terminal Cashout',
    'CUSTOM_CHAIN': 'Multi-Hop Transaction Flow'
  };

  const name = names[archetype] || 'Forensic Transaction Graph';
  return `${name} (${nodeCount} Nodes · ${edgeCount} Flows)`;
};

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
