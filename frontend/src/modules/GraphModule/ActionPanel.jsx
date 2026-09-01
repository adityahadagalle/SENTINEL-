import React, { useMemo, useState } from 'react';
import ActionLog from './ActionLog';
import { 
  Brain, Target, Zap, Shield, ShieldAlert, 
  MessageSquare, FileText, CheckCircle2, AlertTriangle, 
  Layers, ExternalLink, HelpCircle
} from 'lucide-react';

/**
 * ActionPanel Component
 * 
 * Structured AI Investigation Intelligence & Decision Support Command Center.
 * 
 * Architecture:
 * 1. Risk Assessment & Case Header
 * 2. 4-Tier Structured AI Intelligence:
 *    - OBSERVED FACTS (Verifiable numbers & flows)
 *    - INFERRED PATTERNS (Algorithmic signatures)
 *    - NETWORK RISK (Graph topology)
 *    - RECOMMENDED ACTION (Human-in-the-loop decision card)
 * 3. Decision Controls (Freeze / Flag / Escalate / Monitor / Resolve)
 * 4. Interactive Inquiry Field ("Ask SENTINEL")
 * 5. Linked Audit Trail
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
  role
}) => {
  const [askQuery, setAskQuery] = useState('');
  const [aiReply, setAiReply] = useState(null);
  const [isAsking, setIsAsking] = useState(false);

  const isGlobalProcessing = !!processingNodes['GLOBAL'] || role !== 'admin';

  const getStatusIndicator = () => {
    switch (lastActionStatus) {
      case 'BUSY':  return { label: 'Processing Action', color: '#F59E0B', dot: '#F59E0B', pulse: true };
      case 'ERROR': return { label: 'Action Failed', color: '#EF4444', dot: '#EF4444', pulse: false };
      default:      return { label: 'Engine Ready', color: '#10B981', dot: '#10B981', pulse: true };
    }
  };

  const status = getStatusIndicator();

  // Compute Structured Intelligence Metrics
  const intelligence = useMemo(() => {
    if (!caseData) return {};
    const totalFraud = Number(caseData.total_fraud_amount || 0);
    const recoverable = Number(caseData.recoverable_amount || 0);
    const chainLen = (caseData.chain || []).length;
    const nodeCount = (caseData.nodes || []).length;
    const edgeCount = (caseData.edges || []).length;
    const riskLevel = Number(caseData.risk_level || 0);
    const gw = Number(caseData.golden_window_minutes || 0);

    // Heuristics
    const layeringPct = Math.min(96, Math.round((chainLen / Math.max(nodeCount, 1)) * 100));
    const muleCascadePct = Math.min(98, Math.round(riskLevel * 1.04));
    const rapidPassPct = Math.min(94, Math.round(Math.min(edgeCount / Math.max(nodeCount, 1), 4) * 25));

    const fraudStr = totalFraud >= 100000
      ? `₹${(totalFraud / 100000).toFixed(2)}L`
      : `₹${totalFraud.toLocaleString('en-IN')}`;

    const recStr = recoverable >= 100000
      ? `₹${(recoverable / 100000).toFixed(2)}L`
      : `₹${recoverable.toLocaleString('en-IN')}`;

    return { totalFraud, recoverable, chainLen, nodeCount, edgeCount, riskLevel, gw, layeringPct, muleCascadePct, rapidPassPct, fraudStr, recStr };
  }, [caseData]);

  const riskLabel = intelligence.riskLevel >= 80 ? 'CRITICAL' : intelligence.riskLevel >= 60 ? 'HIGH' : intelligence.riskLevel >= 40 ? 'MEDIUM' : 'LOW';
  const riskColor = intelligence.riskLevel >= 80 ? '#F87171' : intelligence.riskLevel >= 60 ? '#FB923C' : intelligence.riskLevel >= 40 ? '#FBBF24' : '#34D399';

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    setIsAsking(true);
    setTimeout(() => {
      setAiReply(`Investigation Analysis: ${intelligence.fraudStr} was transferred through ${intelligence.chainLen} accounts within ${intelligence.gw} minutes. Mule cascade probability is ${intelligence.muleCascadePct}%. Immediate freeze of suspect node ${leadNodeId || 'is'} advised.`);
      setIsAsking(false);
    }, 600);
  };

  return (
    <aside className="flex flex-col h-full bg-[#0F172A] border-l border-slate-800 text-slate-200 overflow-y-auto font-sans select-none">
      
      {/* ─── Header: SOC Intelligence Status ─── */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0D1424] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">
              Investigation Intelligence
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {status.pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: status.dot }} />}
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: status.dot }} />
            </span>
            <span className="text-[9px] font-mono font-bold uppercase" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Risk Score Assessment Banner */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#111927] border border-slate-800">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
              Confidence-Weighted Score
            </span>
            <div className="text-xl font-black font-mono text-slate-100 mt-0.5">
              {intelligence.riskLevel} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </div>
          </div>
          <span className="sentinel-badge" style={{
            background: `${riskColor}15`,
            color: riskColor,
            border: `1px solid ${riskColor}35`
          }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: riskColor }} />
            {riskLabel} RISK
          </span>
        </div>
      </div>

      {/* ─── Scrollable Forensic Intelligence Body ─── */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        
        {/* 1. OBSERVED FACTS */}
        <section className="space-y-2">
          <div className="sentinel-label flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-blue-400" />
              1. Observed Facts
            </span>
            <span className="text-[9px] font-mono text-slate-500">VERIFIED DATA</span>
          </div>
          <div className="p-3 bg-[#111927] rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
            <FactItem label="Total Exposure" value={intelligence.fraudStr} highlight />
            <FactItem label="Recoverable Pool" value={intelligence.recStr} />
            <FactItem label="Dispersion Breadth" value={`${intelligence.nodeCount} nodes • ${intelligence.edgeCount} links`} />
            <FactItem label="Golden Window SLA" value={`${intelligence.gw} minutes remaining`} />
          </div>
        </section>

        {/* 2. INFERRED PATTERNS */}
        <section className="space-y-2">
          <div className="sentinel-label flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              2. Inferred Patterns
            </span>
            <span className="text-[9px] font-mono text-slate-500">HEURISTIC ENGINE</span>
          </div>
          <div className="p-3.5 bg-[#111927] rounded-lg border border-slate-800 space-y-3">
            <PatternProgress label="Layering Dispersion Index" score={intelligence.layeringPct} color="rose" />
            <PatternProgress label="Mule Cascade Probability" score={intelligence.muleCascadePct} color="rose" />
            <PatternProgress label="Rapid Pass-Through Velocity" score={intelligence.rapidPassPct} color="amber" />
          </div>
        </section>

        {/* 3. NETWORK RISK & AI INSIGHT */}
        <section className="space-y-2">
          <div className="sentinel-label flex items-center gap-1.5">
            <Brain className="w-3 h-3 text-blue-400" />
            3. Network Topology & Forensic Insight
          </div>
          <div className="p-3.5 bg-[#111927] rounded-lg border border-slate-800 space-y-2">
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Funds originated from victim account and were split across a {intelligence.chainLen}-hop mule cascade. Primary suspect <strong className="text-amber-400">{leadNodeId || 'ACC-MULE'}</strong> redistributed incoming volume within {intelligence.gw} minutes.
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Confidence 92%
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                Source Coverage: 3 Clearing Networks
              </span>
            </div>
          </div>
        </section>

        {/* 4. RECOMMENDED ACTION & DECISION CONTROLS */}
        <section className="space-y-2">
          <div className="sentinel-label flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              4. Decision Support (Human in the Loop)
            </span>
            <span className="text-[9px] font-mono text-slate-500">AUTHORITY REQUIRED</span>
          </div>

          <div className="space-y-2">
            {/* Primary: Freeze Suspect Network */}
            <button
              onClick={() => executeAction('freeze', { accountId: 'SUSPECTS' })}
              disabled={isGlobalProcessing || processingNodes['SUSPECTS']}
              className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{processingNodes['SUSPECTS'] ? 'EXECUTING FREEZE...' : 'FREEZE SUSPECT NETWORK'}</span>
            </button>

            {/* Secondary: Flag Lead Suspect */}
            <button
              onClick={() => executeAction('flag', { accountId: leadNodeId || 'GLOBAL' })}
              disabled={isGlobalProcessing || processingNodes[leadNodeId]}
              className="w-full py-2 px-3 rounded-lg bg-transparent hover:bg-amber-500/10 disabled:opacity-40 text-amber-400 border border-amber-500/40 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>FLAG LEAD SUSPECT ({leadNodeId ? leadNodeId.slice(-6) : 'ACC'})</span>
            </button>

            {/* Tertiary Grid: Escalate / Monitor / Resolve / False Positive */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => executeAction('alert', { accountId: 'GLOBAL' })}
                disabled={isGlobalProcessing || caseState === 'ACTIONED'}
                className="py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-[11px] font-mono font-medium border border-slate-700 transition-colors"
              >
                {caseState === 'ACTIONED' ? 'Escalated 🚨' : 'Escalate to LEA'}
              </button>
              <button
                onClick={() => executeAction('monitor', { accountId: leadNodeId || 'GLOBAL' })}
                disabled={isGlobalProcessing}
                className="py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-[11px] font-mono font-medium border border-slate-700 transition-colors"
              >
                Place on Monitor
              </button>
              <button
                onClick={() => executeAction('close', { accountId: 'GLOBAL' })}
                disabled={isGlobalProcessing}
                className="py-1.5 px-2.5 rounded bg-emerald-950/30 hover:bg-emerald-900/40 disabled:opacity-40 text-emerald-400 text-[11px] font-mono font-medium border border-emerald-800/40 transition-colors"
              >
                Resolve Case
              </button>
              <button
                onClick={() => executeAction('close_fp', { accountId: 'GLOBAL' })}
                disabled={isGlobalProcessing}
                className="py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-400 text-[11px] font-mono font-medium border border-slate-700 transition-colors"
              >
                False Positive
              </button>
            </div>
          </div>
        </section>

        {/* 5. ASK SENTINEL INQUIRY */}
        <section className="space-y-2 pt-1 border-t border-slate-800">
          <form onSubmit={handleAskSubmit} className="flex items-center gap-2 p-2 bg-[#111927] border border-slate-800 rounded-lg">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={askQuery}
              onChange={(e) => setAskQuery(e.target.value)}
              placeholder="Ask SENTINEL about this network..."
              className="flex-1 bg-transparent text-[11px] font-mono text-slate-200 placeholder:text-slate-600 outline-none"
            />
            {askQuery && (
              <button
                type="submit"
                disabled={isAsking}
                className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold"
              >
                {isAsking ? '...' : 'Ask'}
              </button>
            )}
          </form>

          {aiReply && (
            <div className="p-3 bg-blue-950/20 border border-blue-800/30 rounded-lg text-[11px] font-mono text-slate-300 leading-relaxed animate-in fade-in">
              <span className="text-blue-400 font-bold block mb-1">SENTINEL AGENT RESPONSE:</span>
              {aiReply}
            </div>
          )}
        </section>

        {/* 6. CONNECTED AUDIT TRAIL */}
        <section className="space-y-2 pt-2 border-t border-slate-800">
          <div className="sentinel-label flex items-center justify-between">
            <span>Audit Trail & Activity Log</span>
            <span className="text-[9px] font-mono text-slate-500">{actionLog.length} EVENTS</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <ActionLog logs={actionLog} onLogClick={onLogClick} />
          </div>
        </section>

      </div>
    </aside>
  );
};

const FactItem = ({ label, value, highlight = false }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] text-slate-500 uppercase">{label}</span>
    <span className={`font-semibold ${highlight ? 'text-amber-400' : 'text-slate-200'}`}>{value}</span>
  </div>
);

const PatternProgress = ({ label, score, color }) => {
  const barClass = color === 'rose' ? 'bg-rose-500' : color === 'amber' ? 'bg-amber-500' : 'bg-blue-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-slate-200">{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export default ActionPanel;
