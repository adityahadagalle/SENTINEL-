import React, { useMemo, useState, useEffect } from 'react';
import ActionLog from './ActionLog';
import { 
  Brain, Target, Zap, Shield, ShieldAlert, 
  MessageSquare, FileText, CheckCircle2, AlertTriangle, 
  Layers, ExternalLink, HelpCircle, ArrowRight, Play, FileSpreadsheet
} from 'lucide-react';

/**
 * ActionPanel Component
 * 
 * Structured AI Investigation Intelligence & Decision Support Command Center.
 * Includes:
 * 1. Animated Risk & Metric Progress Gauges (Layering Index, Mule Cascade Probability, Velocity)
 * 2. "WHY THIS CASE MATTERS" Numbered Evidence Citation Block with Interactive Graph Jumps
 * 3. AI Insight Narrative with 94% Model Confidence
 * 4. Primary sticky CTA buttons (Trace Path, Submit SAR / Report)
 * 5. Instant automated intervention triggers (Freeze, Alert, Monitor)
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
  const [askQuery, setAskQuery] = useState('');
  const [aiReply, setAiReply] = useState(null);
  const [isAsking, setIsAsking] = useState(false);

  // Animated progress bar states
  const [dispersionProgress, setDispersionProgress] = useState(0);
  const [muleProgress, setMuleProgress] = useState(0);
  const [velocityProgress, setVelocityProgress] = useState(0);

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

  // Mount animation for metric gauges
  useEffect(() => {
    const timer = setTimeout(() => {
      setDispersionProgress(intelligence.layeringPct || 84);
      setMuleProgress(intelligence.muleCascadePct || 91);
      setVelocityProgress(intelligence.velocityPct || 86);
    }, 150);
    return () => clearTimeout(timer);
  }, [intelligence]);

  const getStatusIndicator = () => {
    switch (lastActionStatus) {
      case 'BUSY':  return { label: 'Executing Intervention', color: '#F59E0B', dot: '#F59E0B', pulse: true };
      case 'ERROR': return { label: 'Action Failed', color: '#EF4444', dot: '#EF4444', pulse: false };
      default:      return { label: 'AI Engine Active', color: '#10B981', dot: '#10B981', pulse: true };
    }
  };

  const status = getStatusIndicator();

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    setIsAsking(true);
    setTimeout(() => {
      setAiReply(`Forensic Analysis for CASE-${String(caseId).slice(-6)}: Rapid capital dispersion detected across ${intelligence.chainLen} accounts within ${intelligence.gw}m window. Suspected coordinated mule ring operating fractional pass-through via UPI. Immediate restriction of target node recommended.`);
      setIsAsking(false);
    }, 500);
  };

  const evidenceCitations = [
    {
      num: 1,
      title: 'High-Velocity Inflow Burst',
      desc: `${intelligence.fraudStr} deposited into victim originator account from external clearing network.`,
      hopIdx: 0,
      badge: 'HOP 0 → 1'
    },
    {
      num: 2,
      title: 'Fractional Layering Dispersion',
      desc: 'Funds fractured into secondary mule accounts within 14 minutes across NEFT/IMPS.',
      hopIdx: 1,
      badge: 'HOP 1 → 2'
    },
    {
      num: 3,
      title: 'Rapid Terminal Fan-Out',
      desc: 'Simultaneous merchant checkout attempts and ATM cash withdrawal triggers detected.',
      hopIdx: 2,
      badge: 'HOP 2 → 3'
    }
  ];

  return (
    <aside className="flex flex-col h-full bg-[#0C1220] border-l border-[#1A2640] text-slate-200 overflow-y-auto select-none">
      
      {/* ── Header: AI Status ── */}
      <div className="px-4 py-3 border-b border-[#1A2640] bg-[#080D18] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300 font-mono">
              Forensic Intelligence
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0F1926] border border-[#1A2640]">
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

      <div className="p-4 space-y-4">

        {/* ── Section 1: AI Insight Callout Block ── */}
        <div className="p-3.5 rounded-sm bg-[#0F1926] border border-blue-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-400" />
              94% Model Confidence
            </span>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase">
              ML SYNTHESIS
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
            High-confidence mule cascade detected. Account structure matches syndicated laundering patterns with a layering dispersion index of <span className="text-rose-400 font-bold">{intelligence.layeringPct}%</span>.
          </p>
        </div>

        {/* ── Section 2: Metric Progress Bars (Animated) ── */}
        <div className="p-3.5 rounded-sm bg-[#0F1926] border border-[#1A2640] space-y-3">
          <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-500">
            Algorithmic Threat Signatures
          </div>
          
          {/* Layering Dispersion Index */}
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400">Layering Dispersion Index</span>
              <span className="text-rose-400 font-bold">{dispersionProgress}%</span>
            </div>
            <div className="s-progress h-1.5">
              <div 
                className="s-progress-fill bg-rose-500 transition-all duration-700 ease-out"
                style={{ width: `${dispersionProgress}%` }}
              />
            </div>
          </div>

          {/* Mule Cascade Probability */}
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400">Mule Cascade Probability</span>
              <span className="text-orange-400 font-bold">{muleProgress}%</span>
            </div>
            <div className="s-progress h-1.5">
              <div 
                className="s-progress-fill bg-orange-500 transition-all duration-700 ease-out"
                style={{ width: `${muleProgress}%` }}
              />
            </div>
          </div>

          {/* Transfer Velocity Spike */}
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-slate-400">Capital Velocity Velocity</span>
              <span className="text-amber-400 font-bold">{velocityProgress}%</span>
            </div>
            <div className="s-progress h-1.5">
              <div 
                className="s-progress-fill bg-amber-500 transition-all duration-700 ease-out"
                style={{ width: `${velocityProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: "WHY THIS CASE MATTERS" Narrative Evidence Citations ── */}
        <div className="p-3.5 rounded-sm bg-[#0F1926] border border-[#1A2640] space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-500">
              Why This Case Matters (Evidence)
            </div>
            <span className="text-[9px] font-mono text-slate-600">3 Citations</span>
          </div>

          <div className="space-y-2">
            {evidenceCitations.map((item) => (
              <div 
                key={item.num}
                className="p-2.5 rounded bg-[#080D18] border border-[#1A2640] hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[9px] font-mono font-bold flex items-center justify-center">
                      {item.num}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-200">{item.title}</span>
                  </div>
                  <span className="text-[8px] font-mono text-slate-500">{item.badge}</span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 leading-relaxed mb-2 pl-5.5">
                  {item.desc}
                </p>
                <div className="pl-5.5">
                  <button
                    onClick={() => onEvidenceClick?.(item.hopIdx)}
                    className="inline-flex items-center gap-1 text-[9px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>[View Graph Flow Step]</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: Human-in-the-Loop Action Controls ── */}
        <div className="p-3.5 rounded-sm bg-[#0F1926] border border-[#1A2640] space-y-3">
          <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-500">
            Enforcement & Legal Interventions
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => executeAction?.('freeze', { accountId: leadNodeId || 'TARGET_MULE' })}
              disabled={isGlobalProcessing}
              className="py-2 px-2.5 rounded bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Freeze Account
            </button>

            <button
              onClick={() => executeAction?.('alert', { type: 'LEGAL_DISCLOSURE' })}
              disabled={isGlobalProcessing}
              className="py-2 px-2.5 rounded bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Police Notice
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => executeAction?.('monitor', { level: 'DEEP_TELEMETRY' })}
              disabled={isGlobalProcessing}
              className="py-2 px-2.5 rounded bg-[#131E2E] hover:bg-[#1A2640] border border-[#1A2640] text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
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
              className="py-2 px-2.5 rounded bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              Generate SAR
            </button>
          </div>
        </div>

        {/* ── Section 5: Ask SENTINEL Interactive Inquiry ── */}
        <div className="p-3.5 rounded-sm bg-[#0F1926] border border-[#1A2640] space-y-2.5">
          <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-500">
            Ask Sentinel Forensic Copilot
          </div>
          <form onSubmit={handleAskSubmit} className="flex gap-1.5">
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="Ask about this pattern or node..."
              className="s-input flex-1 text-[10px]"
            />
            <button
              type="submit"
              disabled={isAsking || !askQuery.trim()}
              className="s-btn-primary py-1 px-3 text-[9px] disabled:opacity-40"
            >
              {isAsking ? '...' : 'Ask'}
            </button>
          </form>
          {aiReply && (
            <div className="p-2.5 rounded bg-[#080D18] border border-blue-500/25 text-[10px] font-mono text-slate-300 leading-relaxed animate-fade-in">
              <span className="text-blue-400 font-bold block mb-1">Copilot Answer:</span>
              {aiReply}
            </div>
          )}
        </div>

        {/* ── Section 6: Action Audit Log ── */}
        <ActionLog actionLog={actionLog} onLogClick={onLogClick} />
      </div>
    </aside>
  );
};

export default ActionPanel;
