import React, { useMemo, useState } from 'react';
import ActionLog from './ActionLog';
import { 
  Brain, Zap, ShieldAlert, AlertTriangle, 
  Layers, ExternalLink, Play, FileSpreadsheet, Shield
} from 'lucide-react';
import { classifyCaseTopology, TOPOLOGY_ARCHETYPES } from '../../utils/topologyEngine';
import { useCountUp } from '../../utils/useCountUp';

/**
 * ActionPanel Component — Depth, Elevation, Animated Metrics & Evidence Center
 */
const ActionPanel = ({ 
  caseId, 
  caseState,
  caseData,
  lastActionStatus,
  leadNodeId,
  processingNodes,
  actionLog, 
  executeAction,
  onLogClick,
  onEvidenceClick,
  role
}) => {
  const isGlobalProcessing = !!processingNodes['GLOBAL'] || role !== 'admin';

  // Compute Structured Intelligence Metrics
  const intelligence = useMemo(() => {
    if (!caseData) return {};
    const totalFraud = Number(caseData.total_fraud_amount || 0);
    const recoverable = Number(caseData.recoverable_amount || 0);
    const chainLen = (caseData.chain || []).length || 4;
    const riskLevel = Number(caseData.risk_level || 0);
    const gw = Number(caseData.golden_window_minutes || 20);

    const layeringPct = Math.min(94, Math.max(68, Math.round(riskLevel * 0.92)));
    const muleCascadePct = Math.min(98, Math.max(74, Math.round(riskLevel * 0.98)));
    const velocityPct = Math.min(96, Math.max(60, Math.round(100 - gw * 1.5)));

    const fraudStr = totalFraud >= 100000
      ? `₹${(totalFraud / 100000).toFixed(2)}L`
      : `₹${totalFraud.toLocaleString('en-IN')}`;

    const recStr = recoverable >= 100000
      ? `₹${(recoverable / 100000).toFixed(2)}L`
      : `₹${recoverable.toLocaleString('en-IN')}`;

    return { totalFraud, recoverable, chainLen, riskLevel, gw, layeringPct, muleCascadePct, velocityPct, fraudStr, recStr };
  }, [caseData]);

  // Animated Count-Up Numbers
  const animatedConfidence = useCountUp(94, 650, 0);
  const animatedLayering = useCountUp(intelligence.layeringPct || 92, 700, 0);
  const animatedMule = useCountUp(intelligence.muleCascadePct || 98, 700, 0);
  const animatedVelocity = useCountUp(intelligence.velocityPct || 70, 700, 0);

  const getStatusIndicator = () => {
    switch (lastActionStatus) {
      case 'BUSY':  return { label: 'Executing Intervention', color: '#F59E0B', dot: '#F59E0B', pulse: true };
      case 'ERROR': return { label: 'Action Failed', color: '#EF4444', dot: '#EF4444', pulse: false };
      default:      return { label: 'AI Engine Active', color: '#10B981', dot: '#10B981', pulse: true };
    }
  };

  const status = getStatusIndicator();
  const archetype = useMemo(() => classifyCaseTopology(caseData), [caseData]);

  const evidenceCitations = useMemo(() => {
    switch (archetype) {
      case TOPOLOGY_ARCHETYPES.FAN_OUT:
        return [
          { num: 1, title: 'High-Velocity Origin Burst', desc: `${intelligence.fraudStr} injected into victim account from external clearing node.`, hopIdx: 0, badge: 'HOP 0→1' },
          { num: 2, title: 'Multi-Branch Parallel Splitting', desc: 'Capital fractured across 4 secondary mule accounts within 12 minutes.', hopIdx: 1, badge: 'HOP 1→2' },
          { num: 3, title: 'Simultaneous Outlet Dispersion', desc: 'Coordinated POS merchant checkouts and ATM cash triggers fired in parallel.', hopIdx: 2, badge: 'HOP 2→3' },
          { num: 4, title: 'Syndicate Signature Match', desc: '98% structural correlation with known automated fan-out smurfing bots.', hopIdx: 3, badge: 'FORENSIC' },
        ];
      case TOPOLOGY_ARCHETYPES.LINEAR_CHAIN:
        return [
          { num: 1, title: 'Deep Multi-Hop Pass-Through', desc: `${intelligence.chainLen}-hop linear transfer sequence across alternating NEFT & IMPS rails.`, hopIdx: 0, badge: 'HOP 0→1' },
          { num: 2, title: 'Zero Holding Time Per Node', desc: 'Funds retained < 4 minutes per intermediary mule before immediate re-forwarding.', hopIdx: 1, badge: 'HOP 1→2' },
          { num: 3, title: 'Synthetic Identity Mules', desc: 'Intermediary accounts created < 14 days prior with zero organic transaction history.', hopIdx: 2, badge: 'HOP 2→3' },
          { num: 4, title: 'Offshore Clearing Target', desc: 'Chain terminates at international routing bridge beyond domestic freeze scope.', hopIdx: 3, badge: 'TERMINAL' },
        ];
      case TOPOLOGY_ARCHETYPES.FAN_IN:
        return [
          { num: 1, title: 'Multi-Victim Feeder Inflow', desc: `3 distinct victim source accounts depositing ${intelligence.fraudStr} into single hub.`, hopIdx: 0, badge: 'INFLOW' },
          { num: 2, title: 'Aggregator Collector Hub', desc: 'Central collector mule pooling disparate fraud streams within 45-minute window.', hopIdx: 1, badge: 'HUB' },
          { num: 3, title: 'Crypto OTC Desk Sweeper', desc: 'Consolidated balance swept into private crypto desk OTC settlement account.', hopIdx: 2, badge: 'DRAIN' },
          { num: 4, title: 'Device Fingerprint Clustering', desc: 'Identical IMEI & IP subnet shared across all upstream feeder initiations.', hopIdx: 3, badge: 'TELEMETRY' },
        ];
      case TOPOLOGY_ARCHETYPES.CIRCULAR_LOOP:
        return [
          { num: 1, title: 'High-Frequency Round-Tripping', desc: `Funds routed through 3 wash accounts and cycled back to origin cluster.`, hopIdx: 0, badge: 'HOP 0→1' },
          { num: 2, title: 'Artificial Turnover Inflation', desc: 'Non-economic wash transactions engineered to simulate legitimate volume.', hopIdx: 1, badge: 'HOP 1→2' },
          { num: 3, title: 'Systematic Fee Deductions', desc: 'Predictable 2.5% pass-through commission retained by intermediary nodes.', hopIdx: 2, badge: 'HOP 2→3' },
          { num: 4, title: 'Scripted Timing Periodicity', desc: 'Exact 360-second intervals between cycle legs indicating bot orchestration.', hopIdx: 3, badge: 'CYCLE' },
        ];
      case TOPOLOGY_ARCHETYPES.STRUCTURING_PASS_THROUGH:
        return [
          { num: 1, title: 'Smurfing Threshold Evasion', desc: `Transfers structured strictly below ₹50,000 to bypass mandatory AML reporting.`, hopIdx: 0, badge: 'HOP 0→1' },
          { num: 2, title: 'Dynamic UPI Handle Generation', desc: 'Disposable UPI IDs registered on virtual telecom numbers utilized for routing.', hopIdx: 1, badge: 'HOP 1→2' },
          { num: 3, title: 'Commercial Merchant POS Laundering', desc: 'Funds disbursed to 3 retail POS merchants for non-existent goods/vouchers.', hopIdx: 2, badge: 'HOP 2→3' },
          { num: 4, title: 'Velocity Burst Anomaly', desc: '14 micro-transactions executed within 18 minutes from single device IP.', hopIdx: 3, badge: 'VELOCITY' },
        ];
      case TOPOLOGY_ARCHETYPES.DIRECT_CASHOUT:
      default:
        return [
          { num: 1, title: 'High-Risk Account Compromise', desc: `Immediate ${intelligence.fraudStr} drain following unauthorized credential modification.`, hopIdx: 0, badge: 'HOP 0→1' },
          { num: 2, title: 'Rapid ATM Terminal Withdrawal', desc: 'Cashout initiated at physical ATM kiosk 8.4km from account owner address.', hopIdx: 1, badge: 'HOP 1→2' },
          { num: 3, title: 'Critical SLA Window', desc: `Only ${intelligence.gw}m remaining before terminal settlement irreversible.`, hopIdx: 1, badge: 'URGENT' },
          { num: 4, title: 'Law Enforcement Hot-Alert', desc: 'Automated notice dispatched to local cyber cell with ATM CCTV request.', hopIdx: 1, badge: 'POLICE' },
        ];
    }
  }, [archetype, intelligence]);

  return (
    <aside className="flex flex-col h-full bg-[#080D18] text-slate-200 overflow-y-auto select-none">
      
      {/* ── Header: AI Status ── */}
      <div className="px-4 py-3 border-b border-[#1A2640] bg-[#0A1020] shrink-0 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-200 font-mono">
              Forensic Intelligence
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#060B14] border border-[#1A2640]">
            <span className="relative flex h-2 w-2">
              {status.pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: status.dot }} />}
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: status.dot }} />
            </span>
            <span className="text-[9px] font-mono font-bold uppercase" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5">

        {/* ── Card 1: AI Insight Callout Block (Elevated) ── */}
        <div className="p-3.5 rounded-sm bg-[#0C1424] border border-blue-500/35 relative overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <div className="flex items-center justify-between mb-1.5 pl-1.5">
            <span className="text-[9.5px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" />
              {animatedConfidence}% Model Confidence
            </span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase font-semibold">
              ML SYNTHESIS
            </span>
          </div>
          <p className="text-[10.5px] font-mono text-slate-300 leading-relaxed pl-1.5">
            High-confidence mule cascade detected. Account structure matches syndicated laundering patterns with a layering dispersion index of <span className="text-rose-400 font-bold">{animatedLayering}%</span>.
          </p>
        </div>

        {/* ── Card 2: Metric Progress Bars (Animated) ── */}
        <div className="p-3.5 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-3 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
            Algorithmic Threat Signatures
          </div>
          
          {/* Layering Dispersion Index */}
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400">Layering Dispersion Index</span>
              <span className="text-rose-400 font-bold tabular-nums">{animatedLayering}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#101A2B] rounded-full overflow-hidden border border-[#1A2640]/60">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                style={{ width: `${animatedLayering}%` }}
              />
            </div>
          </div>

          {/* Mule Cascade Probability */}
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400">Mule Cascade Probability</span>
              <span className="text-orange-400 font-bold tabular-nums">{animatedMule}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#101A2B] rounded-full overflow-hidden border border-[#1A2640]/60">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                style={{ width: `${animatedMule}%` }}
              />
            </div>
          </div>

          {/* Transfer Velocity Spike */}
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400">Transfer Velocity Index</span>
              <span className="text-amber-400 font-bold tabular-nums">{animatedVelocity}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#101A2B] rounded-full overflow-hidden border border-[#1A2640]/60">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                style={{ width: `${animatedVelocity}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Card 3: "WHY THIS CASE MATTERS" Narrative Evidence Citations (Fully Visible, No Truncation) ── */}
        <div className="p-3.5 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-3 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
              Why This Case Matters (Evidence)
            </div>
            <span className="text-[9px] font-mono text-slate-500 font-semibold">4 Citations</span>
          </div>

          <div className="space-y-2">
            {evidenceCitations.map((item) => (
              <div
                key={item.num}
                className="p-2 rounded-sm bg-[#060B14] border border-[#1A2640] hover:border-blue-500/40 transition-all cursor-pointer shadow-sm hover:shadow-[0_2px_8px_rgba(59,130,246,0.15)]"
                onClick={() => onEvidenceClick?.(item.hopIdx)}
              >
                {/* Header row: number badge + title + hop badge + view link */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-4 h-4 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 text-[8px] font-mono font-bold flex items-center justify-center shrink-0">
                    {item.num}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-200 flex-1 truncate">{item.title}</span>
                  <span className="text-[7.5px] font-mono text-slate-500 px-1 py-0.2 rounded bg-[#0D1527] border border-[#1A2640] shrink-0 font-semibold">{item.badge}</span>
                  <span className="text-[8px] font-mono text-blue-400 hover:text-blue-300 shrink-0 transition-colors font-bold">[View →]</span>
                </div>
                {/* Full, readable multi-line description without cut-offs */}
                <p className="text-[9px] font-mono text-slate-400 leading-snug pl-5 break-words">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Card 4: Human-in-the-Loop Action Controls (Elevated) ── */}
        <div className="p-3.5 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-3 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
            Enforcement & Legal Interventions
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => executeAction?.('freeze', { accountId: leadNodeId || 'TARGET_MULE' })}
              disabled={isGlobalProcessing}
              className="py-2 px-2.5 rounded-sm bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(239,68,68,0.2)]"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Freeze Account
            </button>

            <button
              onClick={() => executeAction?.('alert', { type: 'LEGAL_DISCLOSURE' })}
              disabled={isGlobalProcessing}
              className="py-2 px-2.5 rounded-sm bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(245,158,11,0.2)]"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Police Notice
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => executeAction?.('monitor', { level: 'DEEP_TELEMETRY' })}
              disabled={isGlobalProcessing}
              className="py-2 px-2.5 rounded-sm bg-[#101A2B] hover:bg-[#16233B] border border-[#1E2D4A] text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Active Monitor
            </button>

            <button
              onClick={() => {
                const reportText = `SENTINEL INVESTIGATION REPORT\nCase: ${caseId}\nRisk Level: ${intelligence.riskLevel}/100\nTotal Fraud Amount: INR ${intelligence.totalFraud}\nRecoverable Amount: INR ${intelligence.recoverable}`;
                const blob = new Blob([reportText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `SAR_Report_${caseId}.txt`;
                a.click();
              }}
              className="py-2 px-2.5 rounded-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(59,130,246,0.2)]"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              Export SAR
            </button>
          </div>
        </div>

        {/* ── Card 5: Real-time Action Audit Trail ── */}
        <div className="p-3.5 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-2 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
              Audit Event Log
            </span>
            <span className="text-[8px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Immutable Trail
            </span>
          </div>
          <ActionLog actionLog={actionLog} onLogClick={onLogClick} />
        </div>

      </div>
    </aside>
  );
};

export default ActionPanel;
