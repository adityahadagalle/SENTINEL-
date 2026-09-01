"""
evidence_agent.py — Structured evidence collection for SENTINEL.

Collects factual, verifiable evidence from the in-memory data_store.
No hallucination — only fields that actually exist in the data are used.
"""
from datetime import datetime, timezone
from uuid import uuid4


def _evidence_item(ev_type: str, category: str, severity: str, finding: str, data: dict, source: str) -> dict:
    return {
        "id": f"EV-{uuid4().hex[:8].upper()}",
        "type": ev_type,
        "category": category,
        "severity": severity,
        "finding": finding,
        "data": data,
        "source": source,
        "collected_at": datetime.now(timezone.utc).isoformat()
    }


def collect_evidence_for_transaction(tx_id: str, data_store: dict) -> dict:
    """
    Collect all available evidence for a single transaction.
    Returns a structured evidence package.
    """
    tx_store = data_store.get("transactions", {})
    tx = tx_store.get(tx_id)

    if not tx:
        return {
            "found": False,
            "target_id": tx_id,
            "evidence": [
                _evidence_item(
                    "lookup_failure", "system", "info",
                    f"Transaction {tx_id} not found in data store.",
                    {"queried_id": tx_id},
                    "data_store"
                )
            ],
            "summary": {"total_evidence_items": 1}
        }

    evidence = []

    # ── Financial evidence ─────────────────────────────────────────────────
    amount = tx.get("amount", 0)
    evidence.append(_evidence_item(
        "financial", "financial", "high" if amount >= 100000 else "medium",
        f"Transaction of ₹{amount:,.0f} via {tx.get('channel', 'UNKNOWN')} from {tx.get('sender_account')} to {tx.get('receiver_account')}.",
        {
            "amount": amount,
            "currency": tx.get("currency", "INR"),
            "channel": tx.get("channel"),
            "sender": tx.get("sender_account"),
            "receiver": tx.get("receiver_account"),
            "timestamp": tx.get("timestamp"),
        },
        "transaction_record"
    ))

    # ── Risk scoring ───────────────────────────────────────────────────────
    risk_score = tx.get("risk_score", 0)
    if risk_score:
        evidence.append(_evidence_item(
            "risk_score", "assessment", "high" if risk_score >= 70 else "medium",
            f"ML/Rule risk score: {risk_score:.1f}. Confidence: {tx.get('confidence', 'unknown')}.",
            {
                "risk_score": risk_score,
                "ml_score": tx.get("ml_score", 0),
                "rule_score": tx.get("rule_score", 0),
                "confidence": tx.get("confidence"),
                "threshold": tx.get("threshold"),
                "risk_factors": tx.get("risk_factors", []),
            },
            "ml_risk_engine"
        ))

    # ── Behavioral telemetry ───────────────────────────────────────────────
    if tx.get("on_active_call"):
        evidence.append(_evidence_item(
            "behavioral_telemetry", "behavioral", "high",
            "Active voice call detected during transaction — strong indicator of social engineering.",
            {"on_active_call": True},
            "transaction_telemetry"
        ))

    if tx.get("is_cross_border"):
        evidence.append(_evidence_item(
            "behavioral_telemetry", "behavioral", "medium",
            "Cross-border transaction detected.",
            {"is_cross_border": True},
            "transaction_telemetry"
        ))

    # ── Flag reason ────────────────────────────────────────────────────────
    reason = tx.get("reason") or tx.get("full_reason")
    if reason:
        evidence.append(_evidence_item(
            "flag_reason", "assessment", "high",
            reason,
            {"reason": reason, "full_reason": tx.get("full_reason", "")},
            "rule_engine"
        ))

    total = len(evidence)
    return {
        "found": True,
        "target_id": tx_id,
        "evidence": evidence,
        "summary": {
            "total_evidence_items": total,
            "high_severity": sum(1 for e in evidence if e["severity"] == "high"),
            "medium_severity": sum(1 for e in evidence if e["severity"] == "medium"),
        }
    }


def collect_evidence_for_case(case_id: str, data_store: dict) -> dict:
    """
    Collect all available evidence for a fraud case, including linked transactions and graph.
    Returns a structured evidence package.
    """
    case_store = data_store.get("cases", {})
    case = case_store.get(case_id)

    if not case:
        return {
            "found": False,
            "target_id": case_id,
            "case_id": case_id,
            "evidence": [
                _evidence_item(
                    "lookup_failure", "system", "info",
                    f"Case {case_id} not found in data store.",
                    {"queried_id": case_id},
                    "data_store"
                )
            ],
            "summary": {"total_evidence_items": 1}
        }

    evidence = []

    # ── Case overview ──────────────────────────────────────────────────────
    evidence.append(_evidence_item(
        "case_overview", "case", "high",
        f"Fraud case {case_id} — status: {case.get('status', 'NEW')}, risk level: {case.get('risk_level', 0):.1f}.",
        {
            "case_id": case_id,
            "status": case.get("status"),
            "risk_level": case.get("risk_level"),
            "total_fraud_amount": case.get("total_fraud_amount"),
            "recoverable_amount": case.get("recoverable_amount"),
            "recovery_pct": case.get("recovery_pct"),
            "golden_window_minutes": case.get("golden_window_minutes"),
            "chain_length": len(case.get("chain", [])),
        },
        "case_engine"
    ))

    # ── Financial summary ──────────────────────────────────────────────────
    total_fraud = case.get("total_fraud_amount", 0)
    recoverable = case.get("recoverable_amount", 0)
    evidence.append(_evidence_item(
        "financial", "financial", "high" if total_fraud >= 100000 else "medium",
        f"Total fraud exposure: ₹{total_fraud:,.0f}. Recoverable: ₹{recoverable:,.0f} ({case.get('recovery_pct', 0):.1f}%).",
        {
            "total_fraud_amount": total_fraud,
            "recoverable_amount": recoverable,
            "recovery_pct": case.get("recovery_pct", 0),
            "estimated_loss": total_fraud - recoverable,
        },
        "financial_engine"
    ))

    # ── Transaction evidence ───────────────────────────────────────────────
    tx_ids = case.get("transactions", [])
    tx_store = data_store.get("transactions", {})
    for tid in tx_ids:
        tx = tx_store.get(tid)
        if tx:
            evidence.append(_evidence_item(
                "transaction", "transaction", "high" if tx.get("risk_score", 0) >= 70 else "medium",
                f"Linked transaction {tid}: ₹{tx.get('amount', 0):,.0f} via {tx.get('channel', 'UNKNOWN')}. Risk: {tx.get('risk_score', 0):.1f}.",
                {
                    "tx_id": tid,
                    "amount": tx.get("amount"),
                    "channel": tx.get("channel"),
                    "sender": tx.get("sender_account"),
                    "receiver": tx.get("receiver_account"),
                    "risk_score": tx.get("risk_score", 0),
                    "on_active_call": tx.get("on_active_call", False),
                },
                "transaction_record"
            ))

    # ── Graph / network evidence ───────────────────────────────────────────
    graph = data_store.get("graphs", {}).get(case_id)
    if graph:
        nodes = graph.get("nodes", [])
        edges = graph.get("edges", [])
        chain = case.get("chain", [])
        evidence.append(_evidence_item(
            "graph_network", "network", "high" if len(nodes) > 3 else "medium",
            f"Transaction network: {len(nodes)} accounts, {len(edges)} links, chain depth {len(chain)}.",
            {
                "node_count": len(nodes),
                "edge_count": len(edges),
                "chain": chain,
            },
            "graph_engine"
        ))

    total = len(evidence)
    return {
        "found": True,
        "target_id": case_id,
        "case_id": case_id,
        "evidence": evidence,
        "summary": {
            "total_evidence_items": total,
            "high_severity": sum(1 for e in evidence if e["severity"] == "high"),
            "medium_severity": sum(1 for e in evidence if e["severity"] == "medium"),
        }
    }


def collect_evidence(target: str, data_store: dict) -> dict:
    """
    Universal dispatcher — tries case first, then transaction.
    """
    if not target:
        return {
            "found": False,
            "target_id": "",
            "evidence": [],
            "summary": {"total_evidence_items": 0}
        }

    # Try as case
    if target in data_store.get("cases", {}):
        return collect_evidence_for_case(target, data_store)

    # Try as transaction
    if target in data_store.get("transactions", {}):
        return collect_evidence_for_transaction(target, data_store)

    # Not found in either
    return {
        "found": False,
        "target_id": target,
        "evidence": [
            _evidence_item(
                "lookup_failure", "system", "info",
                f"Target {target!r} not found in cases or transactions.",
                {"queried_id": target},
                "data_store"
            )
        ],
        "summary": {"total_evidence_items": 1}
    }
