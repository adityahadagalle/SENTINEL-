import React, { useMemo, useState } from 'react';
import ActionLog from './ActionLog';
import { 
  Brain, Zap, ShieldAlert, AlertTriangle, 
  Layers, ExternalLink, Play, FileSpreadsheet, Shield, 
  CheckCircle2, Lock, UserCheck, Activity, FileText, ArrowRight,
  ChevronRight, RefreshCw, X
} from 'lucide-react';
import { classifyCaseTopology, TOPOLOGY_ARCHETYPES } from '../../utils/topologyEngine';
import { useCountUp } from '../../utils/useCountUp';
import RiskBadge from '../../components/RiskBadge';

/**
 * ActionPanel Component — Unified Forensic Intelligence & Entity Inspector
 * Seamlessly toggles between Case-Level Intelligence and Entity-Specific Deep Inspection.
 */
const ActionPanel = ({ 
  caseId, 
  caseState,
  caseData,
  selectedNode,
  onClearSelectedNode,
  lastActionStatus,
  leadNodeId,
  processingNodes = {},
  actionLog = [], 
  executeAction,
  onLogClick,
  onEvidenceClick,
  role = 'admin'
}) => {
  const [activeTab, setActiveTab] = useState('INTELLIGENCE'); // 'INTELLIGENCE' or 'AUDIT'
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Compute Structured Intelligence Metrics
  const intelligence = useMemo(() => {
    if (!caseData) return {};
    const totalFraud = Number(caseData.total_fraud_amount || 0);
    const recoverable = Number(caseData.recoverable_amount || 0);
    const chainLen = (caseData.chain || []).length || 4;
    const riskLevel = Number(caseData.risk_level || 94);
    const gw = Number(caseData.golden_window_minutes || 20);

    const layeringPct = Math.min(96, Math.max(68, Math.round(riskLevel * 0.94)));
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

  const archetype = useMemo(() => classifyCaseTopology(caseData), [caseData]);

  // "Why SENTINEL Thinks This" Explainable Reasons (Section 7)
  const explainableReasons = useMemo(() => {
    return [
      {
        id: '01',
        title: 'High-Velocity Clearing Burst',
        desc: `${intelligence.fraudStr} injected into primary victim account from unverified external node.`,
        hopIdx: 0,
        highlightType: 'burst',
      },
      {
        id: '02',
        title: 'Coordinated Mule Splitting',
        desc: `Rapid dispersion across ${intelligence.chainLen} intermediary accounts in under 18 minutes.`,
        hopIdx: 1,
        highlightType: 'layering',
      },
      {
        id: '03',
        title: 'Known Syndicated Laundering Pattern',
        desc: `Structural correlation with ${archetype} banking signature matches active cyber-fraud threat database.`,
        hopIdx: 2,
        highlightType: 'syndicate',
      },
      {
        id: '04',
        title: 'Off-Hours Terminal Cashout Risk',
        desc: `Disposable UPI & ATM withdrawal channels scheduled before morning clearing settlement window.`,
        hopIdx: 3,
        highlightType: 'cashout',
      }
    ];
  }, [archetype, intelligence]);

  // Handle Action Trigger with Optional Confirmation Dialog
  const handleTriggerAction = (type, payload = {}, label = '') => {
    if (type.includes('FREEZE') || type.includes('ESCALATE')) {
      setConfirmationModal({ type, payload, label });
    } else {
      executeAction(type, payload);
    }
  };

  const confirmAction = () => {
    if (confirmationModal) {
      executeAction(confirmationModal.type, confirmationModal.payload);
      setConfirmationModal(null);
    }
  };

  return (
    <aside className="flex flex-col h-full bg-[#080D18] text-slate-200 overflow-y-auto select-none">
      
      {/* ── MODE 1: ENTITY INSPECTOR (When a Node is Selected) ── */}
      {selectedNode ? (
        <div className="flex flex-col h-full animate-fade-in">
          
          {/* Entity Inspector Header */}
          <div className="px-4 py-3 border-b border-[#1A2640] bg-[#0A1020] shrink-0 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-100 font-mono">
                Forensic Entity Inspector
              </div>
            </div>
            <button
              onClick={onClearSelectedNode}
              className="p-1 rounded-sm bg-[#060B14] hover:bg-[#131E2E] border border-[#1A2640] text-slate-400 hover:text-white transition-all text-[8.5px] font-mono font-bold flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Back</span>
            </button>
          </div>

          <div className="p-3.5 space-y-3 flex-1 overflow-y-auto">
            
            {/* Entity ID Card */}
            <div className="p-3 rounded-sm bg-[#0C1424] border border-rose-500/30 shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-mono font-bold uppercase text-slate-400">Account Identity</span>
                <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                  {selectedNode.type || 'MULE_ACCOUNT'}
                </span>
              </div>
              <div className="text-[12px] font-mono font-bold text-slate-100 mb-2">
                {selectedNode.id || selectedNode.account_id || 'ACC-WAS-3122'}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#1A2640]">
                <span className="text-[9px] font-mono text-slate-400">Assessed Risk Score</span>
                <RiskBadge score={selectedNode.risk_score || 98} />
              </div>
            </div>

            {/* Transaction Activity Metrics */}
            <div className="p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-2">
              <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Transaction Activity
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono">
                <div className="p-2 rounded bg-[#060B14] border border-[#141E33]">
                  <div className="text-[8px] text-slate-500 uppercase">Inbound Volume</div>
                  <div className="text-slate-100 font-bold tabular-nums mt-0.5">₹80,852</div>
                </div>
                <div className="p-2 rounded bg-[#060B14] border border-[#141E33]">
                  <div className="text-[8px] text-slate-500 uppercase">Outbound Volume</div>
                  <div className="text-amber-400 font-bold tabular-nums mt-0.5">₹79,235</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono pt-1">
                <span className="text-slate-400">Velocity Signature:</span>
                <span className="text-rose-400 font-bold uppercase">High-Frequency Burst</span>
              </div>
            </div>

            {/* Connected Entities Breakdown */}
            <div className="p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-2">
              <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Connected Network Entities (4)
              </div>
              <div className="space-y-1.5 text-[9px] font-mono">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Flagged Mule Accounts:</span>
                  <span className="text-rose-400 font-bold">3 Accounts</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>New Beneficiary Nodes:</span>
                  <span className="text-amber-400 font-bold">1 Account</span>
                </div>
              </div>
            </div>

            {/* Behavioral Percentages */}
            <div className="p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-2.5">
              <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Forensic Behavior Telemetry
              </div>
              {[
                { label: 'Layering Dispersion', value: 92, color: '#EF4444' },
                { label: 'Pass-Through Rate', value: 98, color: '#F97316' },
                { label: 'Ingestion Velocity Burst', value: 70, color: '#F59E0B' },
              ].map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[8.5px] font-mono">
                    <span className="text-slate-400">{m.label}</span>
                    <span className="font-bold tabular-nums" style={{ color: m.color }}>{m.value}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#141E33] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.value}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Node Enforcement Actions */}
            <div className="p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-2">
              <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Enforcement Controls
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTriggerAction('FREEZE_ACCOUNT', { accountId: selectedNode.id }, `Freeze ${selectedNode.id}`)}
                  className="px-2.5 py-1.5 rounded-sm bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>Freeze Node</span>
                </button>
                <button
                  onClick={() => handleTriggerAction('AUTH_CHALLENGE', { accountId: selectedNode.id }, `Step-Up Auth`)}
                  className="px-2.5 py-1.5 rounded-sm bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Step-Up Auth</span>
                </button>
                <button
                  onClick={() => handleTriggerAction('DEEP_TELEMETRY', { accountId: selectedNode.id }, `Monitor Telemetry`)}
                  className="px-2.5 py-1.5 rounded-sm bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Activity className="w-3 h-3 text-blue-400" />
                  <span>60s Monitor</span>
                </button>
                <button
                  onClick={() => handleTriggerAction('POLICE_DISCLOSURE', { accountId: selectedNode.id }, `File Cyber Cell Notice`)}
                  className="px-2.5 py-1.5 rounded-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <FileText className="w-3 h-3 text-purple-400" />
                  <span>91 CrPC Alert</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ── MODE 2: FORENSIC CASE INTELLIGENCE OVERVIEW ── */
        <div className="flex flex-col h-full animate-fade-in">
          
          {/* Header with Tab Switcher */}
          <div className="px-4 py-2.5 border-b border-[#1A2640] bg-[#0A1020] shrink-0 sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-[#060B14] p-0.5 rounded-sm border border-[#1A2640]">
              <button
                onClick={() => setActiveTab('INTELLIGENCE')}
                className={`px-2.5 py-1 rounded-sm text-[8.5px] font-mono font-bold uppercase transition-all ${
                  activeTab === 'INTELLIGENCE'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Forensic Intelligence
              </button>
              <button
                onClick={() => setActiveTab('AUDIT')}
                className={`px-2.5 py-1 rounded-sm text-[8.5px] font-mono font-bold uppercase transition-all ${
                  activeTab === 'AUDIT'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Audit Trail ({actionLog.length})
              </button>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI ENGINE ACTIVE</span>
            </div>
          </div>

          <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto">
            
            {activeTab === 'INTELLIGENCE' ? (
              <>
                {/* AI Assessment Callout Card */}
                <div className="p-3 rounded-sm bg-[#0C1424] border border-blue-500/30 relative overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <div className="flex items-center justify-between mb-1 pl-1">
                    <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-blue-400" />
                      {animatedConfidence}% Model Confidence
                    </span>
                    <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase font-semibold">
                      AUTONOMOUS SYNTHESIS
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-300 leading-relaxed pl-1">
                    High-confidence mule cascade detected. Account network matches syndicated laundering patterns with a layering dispersion index of <span className="text-rose-400 font-bold">{animatedLayering}%</span>.
                  </p>
                </div>

                {/* Section 7: Explainable "Why SENTINEL Thinks This" UX */}
                <div className="p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#1A2640] pb-1.5">
                    <div className="text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-300 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-blue-400" />
                      <span>Why SENTINEL Thinks This</span>
                    </div>
                    <span className="text-[7.5px] font-mono text-slate-500 uppercase">Click to highlight</span>
                  </div>

                  <div className="space-y-1.5">
                    {explainableReasons.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => onEvidenceClick?.(r.hopIdx)}
                        className="p-2 rounded-sm bg-[#080D18] border border-[#1A2640] hover:border-blue-500/50 hover:bg-[#0E172A] cursor-pointer transition-all group"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-mono font-bold text-blue-400">#{r.id}</span>
                            <span className="text-[9.5px] font-mono font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                              {r.title}
                            </span>
                          </div>
                          <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <p className="text-[8.5px] font-mono text-slate-400 leading-normal pl-4">
                          {r.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision Support & Action Recommendations (Section 17) */}
                <div className="p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] space-y-2.5">
                  <div className="text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-300 flex items-center justify-between">
                    <span>Autonomous Decision Support</span>
                    <span className="text-rose-400 font-bold text-[8px]">URGENT SLA</span>
                  </div>

                  <div className="p-2.5 rounded-sm bg-rose-950/15 border border-rose-500/30 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-slate-300 font-bold">RECOMMENDED INTERVENTION:</span>
                      <span className="text-rose-400 font-bold">ESCALATE & FREEZE</span>
                    </div>
                    <div className="text-[8.5px] font-mono text-slate-400">
                      Immediate freeze of primary mule node blocks remaining <span className="text-emerald-400 font-bold">{intelligence.recStr}</span> in-flight funds.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTriggerAction('ESCALATE_CASE', { caseId }, 'Escalate Case to Cyber Cell')}
                      className="px-3 py-2 rounded-sm bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Escalate Case</span>
                    </button>
                    <button
                      onClick={() => handleTriggerAction('FREEZE_MULE_NETWORK', { caseId }, 'Freeze All In-Flight Mule Nodes')}
                      className="px-3 py-2 rounded-sm bg-[#0E1A2E] hover:bg-[#152542] border border-blue-500/40 text-blue-300 text-[9px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Freeze Mules</span>
                    </button>
                    <button
                      onClick={() => handleTriggerAction('SAR_GENERATED', { caseId }, 'Generate SAR Report')}
                      className="px-2.5 py-1.5 rounded-sm bg-[#080D18] hover:bg-[#101A2B] border border-[#1A2640] text-slate-300 text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3 text-purple-400" />
                      <span>Export SAR</span>
                    </button>
                    <button
                      onClick={() => handleTriggerAction('FALSE_POSITIVE', { caseId }, 'Mark Case as False Positive')}
                      className="px-2.5 py-1.5 rounded-sm bg-[#080D18] hover:bg-[#101A2B] border border-[#1A2640] text-slate-400 hover:text-slate-200 text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <UserCheck className="w-3 h-3 text-slate-500" />
                      <span>False Positive</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Regulatory Audit Trail Tab */
              <div className="p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A]">
                <div className="text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-300 mb-2">
                  Regulatory Compliance Audit Trail
                </div>
                <ActionLog actionLog={actionLog} onLogClick={onLogClick} />
              </div>
            )}

          </div>
        </div>
      )}

      {/* Confirmation Modal for High-Impact Actions */}
      {confirmationModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-sm bg-[#0C1424] border border-[#1E2D4A] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.8)] space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 font-mono font-bold text-[12px] uppercase tracking-wider">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Enforcement Action</span>
            </div>
            <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
              Are you sure you want to execute <strong className="text-rose-400">{confirmationModal.label}</strong>? This action enforces regulatory restrictions and logs an immutable audit trail with Cyber Cell authorities.
            </p>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-[#1A2640]">
              <button
                onClick={() => setConfirmationModal(null)}
                className="px-3 py-1.5 rounded-sm bg-[#080D18] border border-[#1A2640] text-slate-300 text-[9px] font-mono font-bold uppercase hover:bg-[#121B2D] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-1.5 rounded-sm bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(239,68,68,0.5)]"
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
};

export default ActionPanel;
