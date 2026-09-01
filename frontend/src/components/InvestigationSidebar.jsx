import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ArrowRight, AlertTriangle, ShieldCheck, Layers, 
  Clock, Network, Shield, ExternalLink, Activity, Info
} from 'lucide-react';
import RiskBadge from './RiskBadge';
import { maskAccount } from '../utils/maskAccount';

/**
 * InvestigationSidebar Component
 * 
 * High-density forensic inspector slide-over panel.
 * Shows transaction metrics, multi-hop flow path, pattern signals, and direct action triggers.
 */
const InvestigationSidebar = ({
  isOpen,
  selectedTransaction,
  selectedCase,
  actions = [],
  onClose,
  role
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'flow' | 'patterns' | 'audit'
  const navigate = useNavigate();
  const isViewer = role !== 'admin';

  if (!isOpen) return null;

  const formatMask = (val) => {
    if (!val) return '—';
    return isViewer ? maskAccount(val) : val;
  };

  const formatCurrency = (val) => {
    if (!val && val !== 0) return '—';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const handleOpenGraph = (caseId) => {
    onClose();
    navigate(`/graph/${caseId}`);
  };

  const tx = selectedTransaction;
  const c = selectedCase;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-150"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed top-0 right-0 h-full w-[460px] max-w-full z-50 flex flex-col bg-[#0F172A] border-l border-slate-800 shadow-2xl shadow-black/80 animate-in slide-in-from-right duration-200 overflow-hidden font-sans">
        
        {/* ─── Drawer Header ─── */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0D1424] flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Forensic Inspector
              </h2>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              {tx ? `TXN: ${formatMask(tx.tx_id)}` : c ? `CASE: ${c.case_id}` : 'Entity Investigation'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ─── Inspector Tabs ─── */}
        <div className="flex items-center border-b border-slate-800 bg-[#0A111E] px-4 shrink-0">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'flow', label: '3-Hop Flow' },
            { id: 'patterns', label: 'Pattern Signals' },
            { id: 'audit', label: `Audit Log (${actions.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-3 text-[11px] font-mono font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab Contents (Scrollable) ─── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Linked Case Alert Banner */}
              {c && (
                <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 font-mono block">
                      Linked Active Case
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {c.case_id}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Risk {c.risk_level}/100 • {c.status}
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenGraph(c.case_id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-all shadow-md"
                  >
                    <Network className="w-3 h-3" />
                    <span>Open Graph</span>
                  </button>
                </div>
              )}

              {/* Transaction Metrics Grid */}
              {tx && (
                <div className="space-y-2">
                  <div className="sentinel-label flex items-center gap-1.5">
                    <Activity className="w-3 h-3" />
                    Transaction Parameters
                  </div>
                  <div className="bg-[#111927] rounded-lg border border-slate-800 divide-y divide-slate-800/70">
                    <MetricRow label="Tx ID" value={formatMask(tx.tx_id)} mono />
                    <MetricRow label="Amount" value={formatCurrency(tx.amount)} mono highlight />
                    <MetricRow label="Channel" value={tx.channel || 'UPI'} mono />
                    <MetricRow label="Timestamp" value={tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : '—'} mono />
                    <MetricRow label="Sender Account" value={formatMask(tx.sender_account)} mono />
                    <MetricRow label="Receiver Account" value={formatMask(tx.receiver_account)} mono />
                    {tx.risk_score !== undefined && (
                      <div className="flex items-center justify-between px-3.5 py-2.5">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">Assessed Risk</span>
                        <RiskBadge score={tx.risk_score} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Anomaly & Risk Factors */}
              {tx?.reason && (
                <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/30 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 font-mono flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Triggered Indicator Rationale
                  </span>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {tx.reason}
                  </p>
                  {tx.full_reason && tx.full_reason !== tx.reason && (
                    <p className="text-[11px] text-slate-400 leading-normal pt-1">
                      {tx.full_reason}
                    </p>
                  )}
                </div>
              )}

              {/* ML vs Rule Scoring */}
              {tx && (tx.ml_score !== undefined || tx.rule_score !== undefined) && (
                <div className="space-y-2">
                  <div className="sentinel-label flex items-center gap-1.5">
                    <Info className="w-3 h-3" />
                    Scoring Engine Breakdown
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-[#111927] border border-slate-800 rounded-lg">
                      <span className="text-[9px] font-mono uppercase text-slate-500 block">ML Engine Score</span>
                      <span className="text-base font-mono font-bold text-slate-100 mt-1 block">
                        {tx.ml_score || 0}<span className="text-[10px] text-slate-500">/100</span>
                      </span>
                    </div>
                    <div className="p-3 bg-[#111927] border border-slate-800 rounded-lg">
                      <span className="text-[9px] font-mono uppercase text-slate-500 block">Rule Engine Score</span>
                      <span className="text-base font-mono font-bold text-slate-100 mt-1 block">
                        {tx.rule_score || 0}<span className="text-[10px] text-slate-500">/100</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 3-HOP FLOW PATH */}
          {activeTab === 'flow' && (
            <div className="space-y-4">
              <div className="sentinel-label flex items-center gap-1.5">
                <Network className="w-3 h-3" />
                Multi-Hop Fund Dispersion Path
              </div>

              {/* Hop Cards Visual Chain */}
              <div className="space-y-3">
                {/* Hop 1 */}
                <div className="p-3.5 bg-[#111927] border border-slate-800 rounded-lg space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                      Hop 1 • Originator / Sender
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">SOURCE ACCOUNT</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-200 pt-1">
                    {tx ? formatMask(tx.sender_account) : c?.chain?.[0] || 'ACC-ORIGIN'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Channel: {tx?.channel || 'UPI'} • Outflow: {formatCurrency(tx?.amount || c?.total_fraud_amount)}
                  </div>
                </div>

                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-4 bg-slate-700" />
                </div>

                {/* Hop 2 */}
                <div className="p-3.5 bg-[#111927] border border-rose-900/40 rounded-lg space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                      Hop 2 • Intermediary / Mule Layer
                    </span>
                    <span className="text-[9px] font-mono text-rose-400">HIGH VELOCITY</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-200 pt-1">
                    {tx ? formatMask(tx.receiver_account) : c?.chain?.[1] || 'ACC-MULE-NODE'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Pass-through: 87% redistributed within golden window
                  </div>
                </div>

                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-4 bg-slate-700" />
                </div>

                {/* Hop 3 */}
                <div className="p-3.5 bg-[#111927] border border-slate-800 rounded-lg space-y-1 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                      Hop 3 • Beneficiary / Cash-Out
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">ATM / WALLET EXIT</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-200 pt-1">
                    {c?.chain?.[2] || 'DOWNSTREAM-EXIT-01'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Recoverable Status: {c ? formatCurrency(c.recoverable_amount) : 'Evaluating'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PATTERN SIGNALS */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="sentinel-label flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                Pattern Signatures & Telemetry
              </div>

              <div className="space-y-3 bg-[#111927] p-4 rounded-lg border border-slate-800">
                <PatternSignalBar label="Layering Dispersion Index" score={89} color="rose" />
                <PatternSignalBar label="Mule Cascade Probability" score={94} color="rose" />
                <PatternSignalBar label="Velocity Pass-Through Ratio" score={82} color="amber" />
                <PatternSignalBar label="Device Re-use Fingerprint" score={68} color="blue" />
              </div>

              <div className="p-3 bg-[#0D1424] rounded-lg border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono">
                <span className="text-blue-400 font-bold block mb-1">OBSERVED BEHAVIOR:</span>
                Rapid succession transfer detected across payment network boundaries. Inbound funds were redistributed across multiple child accounts within 18 minutes.
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="sentinel-label flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Audit Trail & Investigative Actions
              </div>

              {actions.length > 0 ? (
                <div className="space-y-2">
                  {actions.map((act, i) => (
                    <div key={act.action_id || i} className="p-3 bg-[#111927] rounded-lg border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-blue-400">
                          {act.action_type || 'ACTION'}
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {act.status || 'ACK'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Target: {act.target_id || act.account_id || 'GLOBAL'}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        {act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : 'Recorded'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs font-mono">
                  No automated or manual actions logged yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Drawer Footer Actions ─── */}
        <div className="p-4 border-t border-slate-800 bg-[#0D1424] flex items-center justify-between gap-3 shrink-0">
          {c ? (
            <button
              onClick={() => handleOpenGraph(c.case_id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono transition-all shadow-md"
            >
              <Network className="w-4 h-4" />
              <span>LAUNCH GRAPH INVESTIGATION</span>
            </button>
          ) : (
            <div className="text-[10px] font-mono text-slate-500 text-center w-full">
              Select an active case to view interactive network graph.
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

const MetricRow = ({ label, value, mono = false, highlight = false }) => (
  <div className="flex items-center justify-between px-3.5 py-2">
    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono shrink-0">{label}</span>
    <span className={`text-xs text-right truncate max-w-[240px] ${
      mono ? 'font-mono' : ''
    } ${
      highlight ? 'font-bold text-slate-100' : 'text-slate-300 font-medium'
    }`}>
      {value}
    </span>
  </div>
);

const PatternSignalBar = ({ label, score, color }) => {
  const barBg = color === 'rose' ? 'bg-rose-500' : color === 'amber' ? 'bg-amber-500' : 'bg-blue-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-slate-200">{score}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barBg}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
};

export default InvestigationSidebar;
