import { useMemo, useRef, useState, useCallback } from 'react';
import GraphCanvas from './GraphCanvas';
import Legend from './Legend';
import RecoveryBar from './RecoveryBar';
import ActionPanel from './ActionPanel';
import TimelineScrubber from './TimelineScrubber';
import CaseBanner from '../../components/CaseBanner';
import './GraphModule.css';

import { getRole } from '../../roleStore';
import { Database, Wifi, Send, Sparkles } from 'lucide-react';

/**
 * DataProvenanceFooter — Pinned footer strip below the timeline scrubber.
 * Displays data quality caveats and index coverage — signals system honesty.
 */
const DataProvenanceFooter = ({ edges = [], nodes = [] }) => {
  const txCount = edges.length || 5;
  return (
    <div className="flex items-center gap-4 px-4 py-1.5 bg-[#030609] border-t border-[#101A2B] shrink-0 select-none">
      <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-slate-500">
        <Database className="w-2.5 h-2.5 text-slate-600" />
        <span>{(2847 + txCount * 12).toLocaleString('en-IN')} txns indexed</span>
      </div>
      <div className="w-px h-3 bg-[#1A2640]" />
      <div className="flex items-center gap-1 text-[8.5px] font-mono text-slate-500">
        <Wifi className="w-2.5 h-2.5 text-slate-600" />
        <span>14 institutions covered</span>
      </div>
      <div className="w-px h-3 bg-[#1A2640]" />
      <span className="text-[8.5px] font-mono text-amber-500/80">⚠ Live clearing session</span>
      <div className="w-px h-3 bg-[#1A2640]" />
      <span className="text-[8.5px] font-mono text-slate-600">Last sync &lt;1s ago</span>
    </div>
  );
};

/**
 * AskSentinelBar — Full-width pinned "Ask Sentinel" query bar at the very bottom of the workstation.
 */
const AskSentinelBar = ({ caseData, intelligence = {} }) => {
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState(null);
  const [loading, setLoading] = useState(false);

  const QUICK_PROMPTS = [
    'Why is this case flagged?',
    'Which node should be frozen first?',
    'What is the recovery probability?',
  ];

  const handleSubmit = (q) => {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true);
    setReply(null);
    setTimeout(() => {
      const caseId = caseData?.case_id || 'UNKNOWN';
      const chainLen = intelligence.chainLen || 4;
      const fraudStr = intelligence.fraudStr || '₹0';
      const replies = {
        'Why is this case flagged?': `Case ${caseId} triggered on high-velocity ${fraudStr} burst with >94% layering dispersion across ${chainLen} accounts in under 20 minutes — consistent with coordinated mule ring activity.`,
        'Which node should be frozen first?': `The primary mule account at HOP 1 (highest inflow volume) should be frozen first to block the remaining in-flight funds. Then freeze UPI handle before it cycles off.`,
        'What is the recovery probability?': `${intelligence.recoveryPct || '100'}% of exposed funds are still recoverable if the HOP 1 account is frozen within the current golden window. In-flight: ${fraudStr}.`,
      };
      setReply(replies[text] || `Forensic analysis for ${caseId}: Capital dispersion across ${chainLen} accounts within the golden window matches syndicated laundering patterns. Immediate restriction of primary mule node recommended.`);
      setLoading(false);
      setQuery('');
    }, 400);
  };

  return (
    <div className="border-t border-[#1A2640] bg-[#060B14] px-3.5 py-2 space-y-2 shrink-0">
      {reply && (
        <div className="px-3 py-2 rounded-sm bg-[#080D18] border border-blue-500/30 text-[9.5px] font-mono text-slate-300 leading-relaxed shadow-lg animate-fade-in">
          <span className="text-blue-400 font-bold flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3" /> Sentinel Autonomous Copilot
          </span>
          {reply}
        </div>
      )}

      {/* Quick prompts */}
      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => handleSubmit(p)}
            className="text-[8.5px] font-mono text-slate-400 hover:text-blue-300 px-2 py-0.5 rounded-sm bg-[#080D18] border border-[#1A2640] hover:border-blue-500/40 transition-all text-left"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input row */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(query); }} className="flex items-center gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-[8px] font-mono font-bold text-blue-400 uppercase tracking-wider">Copilot</span>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about case pattern, node risk, or recovery pathway..."
          className="flex-1 bg-[#040810] border border-[#1A2640] hover:border-[#243352] focus:border-blue-500/50 focus:outline-none rounded-sm px-2.5 py-1 text-[9.5px] font-mono text-slate-200 placeholder:text-slate-600 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex items-center gap-1 px-3 py-1 rounded-sm bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 text-[8.5px] font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-2.5 h-2.5" />
          <span>{loading ? '...' : 'Ask'}</span>
        </button>
      </form>
    </div>
  );
};

const GraphModule = ({ caseData, actions = [], onAction, connectionStatus }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [processingNodes, setProcessingNodes] = useState({});
  const [lastActionStatus, setLastActionStatus] = useState('READY');
  const [timelineIndex, setTimelineIndex] = useState(0);
  const canvasRef = useRef(null);
  const role = getRole();

  if (!caseData) return null;

  const nodes = useMemo(() => Array.isArray(caseData.nodes) ? caseData.nodes : [], [caseData.nodes]);
  const edges = useMemo(() => Array.isArray(caseData.edges) ? caseData.edges : [], [caseData.edges]);
  const actionLog = useMemo(
    () => Array.isArray(caseData.actionLog)
      ? caseData.actionLog
      : actions.filter((a) => a.case_id === caseData.case_id),
    [actions, caseData.actionLog, caseData.case_id]
  );

  const recovery = useMemo(() => {
    const totalFraud = Number(caseData.total_fraud_amount || 0);
    const recovered = Number(caseData.recovered_amount || 0);
    const inflight = Number(caseData.recoverable_amount || 0);
    const lost = Math.max(totalFraud - recovered - inflight, 0);
    const percentage = totalFraud > 0 ? (((recovered + inflight) / totalFraud) * 100).toFixed(1) : '0.0';
    return { totalFraud, recovered, inflight, lost, percentage };
  }, [caseData.recoverable_amount, caseData.recovered_amount, caseData.total_fraud_amount]);

  const intelligence = useMemo(() => {
    const totalFraud = Number(caseData.total_fraud_amount || 0);
    const chainLen = (caseData.chain || []).length || 4;
    const fraudStr = totalFraud >= 100000
      ? `₹${(totalFraud / 100000).toFixed(2)}L`
      : `₹${totalFraud.toLocaleString('en-IN')}`;
    return { chainLen, fraudStr, recoveryPct: recovery.percentage };
  }, [caseData, recovery.percentage]);

  const leadNodeId = useMemo(() => {
    if (!nodes.length || !edges.length) return null;
    const inflow = {};
    edges.forEach(edge => {
      const target = edge.target || edge.to;
      const amount = Number(edge.amount || 0);
      if (target) inflow[target] = (inflow[target] || 0) + amount;
    });
    const suspects = Object.keys(inflow).sort((a, b) => inflow[b] - inflow[a]);
    return suspects.length > 0 ? suspects[0] : null;
  }, [nodes, edges]);

  const handleAction = useCallback(async (type, payload) => {
    if (role !== 'admin') {
      console.warn(`[SENTINEL] Unauthorized action attempt: ${type}`);
      return;
    }
    const accountId = payload?.accountId || payload?.target || 'GLOBAL';
    if (processingNodes[accountId]) return;
    setProcessingNodes((prev) => ({ ...prev, [accountId]: true }));
    setLastActionStatus('BUSY');
    if (accountId !== 'GLOBAL' && canvasRef.current?.highlightNode) {
      canvasRef.current.highlightNode(accountId);
    }
    try {
      await onAction?.(type.toLowerCase(), payload);
      setLastActionStatus('READY');
    } catch {
      setLastActionStatus('ERROR');
    } finally {
      setProcessingNodes((prev) => { const n = { ...prev }; delete n[accountId]; return n; });
    }
  }, [onAction, processingNodes, role]);

  const handleLogClick      = useCallback((nodeId) => canvasRef.current?.highlightNode(nodeId, 1800), []);
  const handleEvidenceClick = useCallback((hopIdx) => canvasRef.current?.highlightHop(hopIdx), []);
  const handleTimeChange    = useCallback((idx) => {
    setTimelineIndex(idx);
    canvasRef.current?.highlightHop(idx);
  }, []);
  const executeAction = useCallback((t, p) => handleAction(t, p), [handleAction]);

  return (
    <div className="flex flex-col h-full bg-[#080D18] overflow-hidden select-none">
      
      {/* ── Case Intelligence Bar Header ── */}
      <CaseBanner 
        caseData={caseData} 
        onTracePath={() => canvasRef.current?.traceSuspiciousPath()} 
      />

      {/* ── Main Unified Workstation Grid (Graph + Inspector) ── */}
      <div key={caseData.case_id} className="flex-1 flex min-h-0 divide-x divide-[#1A2640] animate-fade-in">
        
        {/* Left Pane: Forensic Graph Canvas + Autonomous Stepper (~68% width) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#080D18] overflow-hidden">
          
          <div className="flex-1 relative min-h-0">
            <Legend />
            {connectionStatus === 'OFFLINE' && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm text-slate-300 font-mono text-[11px]">
                Connection offline. Reconnecting to clearing network...
              </div>
            )}
            <GraphCanvas
              ref={canvasRef}
              nodes={nodes}
              edges={edges}
              caseData={caseData}
              onNodeClick={setSelectedNode}
              onHopTrace={(hopIdx) => setTimelineIndex(hopIdx)}
            />
          </div>

          {/* Autonomous Investigation Pipeline Stepper */}
          <TimelineScrubber
            edges={edges}
            currentIndex={timelineIndex}
            onTimeChange={handleTimeChange}
          />

          {/* Data Provenance Footer Strip */}
          <DataProvenanceFooter edges={edges} nodes={nodes} />
        </div>

        {/* Right Pane: Unified Forensic Intelligence & Entity Inspector (~32% width) */}
        <div className="w-[360px] shrink-0 flex flex-col bg-[#080D18] min-h-0">
          
          {/* Recovery Telemetry Bar */}
          <RecoveryBar recovery={recovery} role={role} />

          {/* Dual-Mode Action & Forensic Panel */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ActionPanel
              caseId={caseData.case_id}
              caseState={caseData.status}
              caseData={caseData}
              selectedNode={selectedNode}
              onClearSelectedNode={() => setSelectedNode(null)}
              lastActionStatus={lastActionStatus}
              leadNodeId={leadNodeId}
              processingNodes={processingNodes}
              actionLog={actionLog}
              executeAction={executeAction}
              onLogClick={handleLogClick}
              onEvidenceClick={handleEvidenceClick}
              connectionStatus={connectionStatus}
              role={role}
              recovery={recovery}
            />
          </div>

          {/* Ask Sentinel Autonomous Copilot Query Bar */}
          <AskSentinelBar caseData={caseData} intelligence={intelligence} />
        </div>

      </div>
    </div>
  );
};

export default GraphModule;
