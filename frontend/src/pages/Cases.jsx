import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import RiskBadge from '../components/RiskBadge';
import { getRole } from '../roleStore';
import { 
  Network, Search, Clock, AlertTriangle, ShieldCheck, 
  ArrowRight, X, ExternalLink, Activity, Layers, DollarSign 
} from 'lucide-react';

/**
 * Mini Topology SVG thumbnail generator based on case hops / chain length
 */
const MiniTopologySVG = ({ hops = 2, isCritical = false }) => {
  const strokeColor = isCritical ? '#EF4444' : '#3B82F6';
  const nodeColor = isCritical ? '#F87171' : '#60A5FA';

  if (hops >= 5) {
    return (
      <svg className="w-10 h-5" viewBox="0 0 40 20" fill="none">
        <line x1="4" y1="10" x2="13" y2="5" stroke={strokeColor} strokeWidth="1" strokeDasharray="1 1" />
        <line x1="4" y1="10" x2="13" y2="15" stroke={strokeColor} strokeWidth="1" />
        <line x1="13" y1="5" x2="24" y2="10" stroke={strokeColor} strokeWidth="1" />
        <line x1="13" y1="15" x2="24" y2="10" stroke={strokeColor} strokeWidth="1" />
        <line x1="24" y1="10" x2="36" y2="10" stroke={strokeColor} strokeWidth="1" />
        <circle cx="4" cy="10" r="2.5" fill="#3B82F6" />
        <circle cx="13" cy="5" r="2" fill={nodeColor} />
        <circle cx="13" cy="15" r="2" fill={nodeColor} />
        <circle cx="24" cy="10" r="2" fill={nodeColor} />
        <circle cx="36" cy="10" r="2.5" fill="#10B981" />
      </svg>
    );
  }
  if (hops >= 3) {
    return (
      <svg className="w-10 h-5" viewBox="0 0 40 20" fill="none">
        <line x1="5" y1="10" x2="20" y2="5" stroke={strokeColor} strokeWidth="1" />
        <line x1="5" y1="10" x2="20" y2="15" stroke={strokeColor} strokeWidth="1" strokeDasharray="1 1" />
        <line x1="20" y1="5" x2="35" y2="10" stroke={strokeColor} strokeWidth="1" />
        <line x1="20" y1="15" x2="35" y2="10" stroke={strokeColor} strokeWidth="1" />
        <circle cx="5" cy="10" r="2.5" fill="#3B82F6" />
        <circle cx="20" cy="5" r="2" fill={nodeColor} />
        <circle cx="20" cy="15" r="2" fill={nodeColor} />
        <circle cx="35" cy="10" r="2.5" fill="#10B981" />
      </svg>
    );
  }
  return (
    <svg className="w-10 h-5" viewBox="0 0 40 20" fill="none">
      <line x1="8" y1="10" x2="32" y2="10" stroke={strokeColor} strokeWidth="1" strokeDasharray={isCritical ? "2 1" : "none"} />
      <circle cx="8" cy="10" r="2.5" fill="#3B82F6" />
      <circle cx="32" cy="10" r="2.5" fill={isCritical ? "#EF4444" : "#10B981"} />
    </svg>
  );
};

const Cases = () => {
  const navigate = useNavigate();
  const { cases, actions, transactions } = useWebSocket();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const role = getRole();

  const ALL_STATUSES = ['ALL', 'NEW', 'HIGH_RISK', 'ACTIONED', 'MONITORING', 'CLOSED'];

  // Ensure deterministic, rich procedural variance for demo seeds
  const enrichedCases = useMemo(() => {
    return cases.map((c, index) => {
      // Deterministic pseudo-random seed from case_id
      const charCodeSum = (c.case_id || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + index * 17;
      
      const seedRisk = 62 + (charCodeSum % 39); // 62 - 100
      const risk_level = c.risk_level !== undefined ? c.risk_level : seedRisk;
      
      const seedHops = 2 + (charCodeSum % 5); // 2 - 6 hops
      const hops = Array.isArray(c.chain) && c.chain.length > 2 ? c.chain.length : seedHops;
      
      const seedWindow = [5, 12, 18, 24, 35, 45][charCodeSum % 6];
      const golden_window_minutes = c.golden_window_minutes || seedWindow;
      
      const seedAmount = 45000 + (charCodeSum * 1373) % 480000;
      const total_fraud_amount = c.total_fraud_amount || seedAmount;
      const recoverable_amount = c.recoverable_amount || Math.round(total_fraud_amount * (0.65 + (charCodeSum % 30) / 100));

      return {
        ...c,
        risk_level,
        hops,
        golden_window_minutes,
        total_fraud_amount,
        recoverable_amount,
        chain: Array.isArray(c.chain) && c.chain.length > 0 ? c.chain : [
          `ACC-VICTIM-${1000 + (charCodeSum % 8999)}`,
          `ACC-MULE-A-${2000 + (charCodeSum % 8999)}`,
          `ACC-MULE-B-${3000 + (charCodeSum % 8999)}`,
          `ACC-MERCH-${4000 + (charCodeSum % 8999)}`
        ].slice(0, hops)
      };
    });
  }, [cases]);

  const totalFraudExposure = useMemo(() => enrichedCases.reduce((sum, c) => sum + (c.total_fraud_amount || 0), 0), [enrichedCases]);
  const totalRecoverable = useMemo(() => enrichedCases.reduce((sum, c) => sum + (c.recoverable_amount || 0), 0), [enrichedCases]);
  const criticalCount = useMemo(() => enrichedCases.filter(c => (c.risk_level || 0) >= 85).length, [enrichedCases]);
  const actionedCount = useMemo(() => enrichedCases.filter(c => c.status === 'ACTIONED').length, [enrichedCases]);

  const filteredCases = useMemo(() => {
    return [...enrichedCases]
      .filter(c => {
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (riskFilter === 'CRITICAL' && (c.risk_level || 0) < 85) return false;
        if (riskFilter === 'HIGH' && (c.risk_level || 0) < 70) return false;
        if (riskFilter === 'MEDIUM' && (c.risk_level || 0) >= 70) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!(c.case_id || '').toLowerCase().includes(q) &&
              !(c.primary_tx_id || '').toLowerCase().includes(q) &&
              !(c.chain || []).some(acc => acc.toLowerCase().includes(q))) return false;
        }
        return true;
      })
      .sort((a, b) => (b.risk_level || 0) - (a.risk_level || 0));
  }, [enrichedCases, statusFilter, riskFilter, searchQuery]);

  const getPriorityClass = (score) => {
    if (score >= 85) return 's-priority-critical';
    if (score >= 70) return 's-priority-high';
    if (score >= 40) return 's-priority-medium';
    return 's-priority-low';
  };

  const getStatusBadge = (status) => {
    const map = {
      NEW:        'bg-blue-500/10 text-blue-400 border-blue-500/20',
      HIGH_RISK:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
      ACTIONED:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      MONITORING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      CLOSED:     'bg-slate-700/40 text-slate-500 border-slate-700/40',
    };
    return map[status] || map.NEW;
  };

  const activeCase = selectedCase ? enrichedCases.find(c => c.case_id === selectedCase.case_id) || selectedCase : null;
  const selectedActions = activeCase ? actions.filter(a => a.case_id === activeCase.case_id) : [];

  return (
    <div className="flex h-full bg-[#080D18] overflow-hidden">

      {/* ── LEFT: Triage Queue ── */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-[#1A2640]">

        {/* Stat strip */}
        <div className="flex items-stretch border-b border-[#1A2640] bg-[#040810] shrink-0 overflow-x-auto">
          {[
            { label: 'Total Cases',       value: cases.length,                        color: '#E2E8F0' },
            { label: 'Critical Triage',   value: criticalCount,                       color: '#F87171' },
            { label: 'Interventions',     value: actionedCount,                       color: '#34D399' },
            { label: 'Fraud Exposure',    value: `₹${totalFraudExposure.toLocaleString('en-IN')}`, color: '#FBBF24' },
            { label: 'Recoverable',       value: `₹${totalRecoverable.toLocaleString('en-IN')}`,  color: '#60A5FA' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col justify-center px-4 py-2.5 border-r border-[#1A2640] shrink-0">
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-600">{stat.label}</div>
              <div className="text-[13px] font-mono font-bold leading-tight" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1A2640] bg-[#06091180] shrink-0 flex-wrap">
          <div className="flex items-center gap-0.5">
            {ALL_STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`s-chip ${statusFilter === s ? 's-chip-active' : ''}`}
              >{s === 'ALL' ? 'All' : s.replace('_', ' ')}</button>
            ))}
          </div>
          <div className="w-px h-4 bg-[#1A2640]" />
          <div className="flex items-center gap-0.5">
            {[{id:'ALL',l:'All Risk'},{id:'CRITICAL',l:'Critical ≥85'},{id:'HIGH',l:'High ≥70'},{id:'MEDIUM',l:'Medium'}].map(r => (
              <button key={r.id} onClick={() => setRiskFilter(r.id)}
                className={`s-chip ${riskFilter === r.id ? 's-chip-active' : ''}`}
              >{r.l}</button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search case ID, account..." className="s-input pl-6 w-44" />
          </div>
          <span className="text-[9px] font-mono text-slate-600">{filteredCases.length} cases</span>
        </div>

        {/* Case table */}
        <div className="flex-1 overflow-auto bg-[#080D18]">
          <table className="s-table w-full min-w-[650px]">
            <thead>
              <tr>
                <th style={{ width: 6 }} className="p-0" />
                <th>Case ID</th>
                <th>Topology</th>
                <th>Status</th>
                <th className="text-center min-w-[140px]">Risk Severity</th>
                <th className="text-right">Exposure Amount</th>
                <th>Chain Depth</th>
                <th>Golden Window</th>
                <th className="text-center">Investigate</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => {
                const score = c.risk_level || 0;
                const isSelected = activeCase?.case_id === c.case_id;
                const isCritical = score >= 85;

                return (
                  <tr
                    key={c.case_id}
                    onClick={() => setSelectedCase(c)}
                    className={`${getPriorityClass(score)} transition-all duration-100 hover:bg-[#131E2E] ${isSelected ? 'bg-blue-500/10 !border-l-blue-400 shadow-[inset_0_0_12px_rgba(59,130,246,0.08)]' : ''}`}
                  >
                    <td className="p-0 w-1.5" />
                    
                    {/* Case ID */}
                    <td className="font-bold text-slate-200 text-[11px] font-mono">
                      {String(c.case_id || '').slice(-8)}
                    </td>

                    {/* Mini SVG Topology Preview */}
                    <td className="py-2">
                      <MiniTopologySVG hops={c.hops} isCritical={isCritical} />
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`s-pill border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>

                    {/* Risk Badge + Horizontal Meter Bar */}
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-2">
                        <RiskBadge score={score} />
                        <div className="w-12 h-1.5 bg-[#1A2640] rounded-full overflow-hidden shrink-0 hidden sm:block">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${score}%`,
                              backgroundColor: isCritical ? '#EF4444' : score >= 70 ? '#F97316' : '#F59E0B'
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Fraud Exposure */}
                    <td className="text-right font-bold text-slate-100 tabular-nums">
                      ₹{Number(c.total_fraud_amount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Account Chain Depth */}
                    <td className="text-slate-400 text-[10px] font-mono">
                      <span className="text-slate-300 font-semibold">{c.hops}</span> hops ({c.chain.length} acc)
                    </td>

                    {/* SLA Golden Window */}
                    <td className="text-slate-400 text-[10px] font-mono">
                      <span className={`inline-flex items-center gap-1 ${c.golden_window_minutes < 15 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                        <Clock className="w-2.5 h-2.5" />
                        {c.golden_window_minutes}m SLA
                      </span>
                    </td>

                    {/* Graph Action CTA */}
                    <td className="text-center">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/graph/${c.case_id}`); }}
                        className="p-1.5 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Open Graph Investigation Canvas"
                      >
                        <Network className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-slate-600 text-[11px] font-mono py-16">
                    No cases match current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RIGHT: Persistent Split-Pane Inspector ── */}
      {activeCase ? (
        <div className="w-[380px] shrink-0 flex flex-col bg-[#060B14] border-l border-[#1A2640] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A2640] shrink-0 bg-[#040810]">
            <div>
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-600">Case Investigation Triage</div>
              <div className="text-[12px] font-mono font-bold text-slate-100 mt-0.5">
                CASE-{String(activeCase.case_id || '').slice(-8)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(`/graph/${activeCase.case_id}`)}
                className="s-btn-primary py-1 px-2.5 text-[9px]"
              >
                <Network className="w-3 h-3" /> Graph Workstation
              </button>
              <button onClick={() => setSelectedCase(null)} className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto divide-y divide-[#1A2640]">
            {/* Risk Assessment */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <RiskBadge score={activeCase.risk_level} />
                <span className={`s-pill border ${getStatusBadge(activeCase.status)}`}>{activeCase.status}</span>
              </div>
              <div className="s-progress mt-2">
                <div className="s-progress-fill" style={{
                  width: `${activeCase.risk_level || 0}%`,
                  background: (activeCase.risk_level || 0) >= 85 ? '#EF4444' : (activeCase.risk_level || 0) >= 70 ? '#F97316' : '#F59E0B'
                }} />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Threat Severity Level</span>
                <span className="font-bold text-slate-300">{activeCase.risk_level || 0} / 100</span>
              </div>
            </div>

            {/* Financial Exposure & Recovery */}
            <div className="p-4 space-y-2.5">
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-600">Financial Exposure Breakdown</div>
              <div className="space-y-1.5">
                {[
                  { l: 'Total Flagged Exposure', v: activeCase.total_fraud_amount,  c: '#F87171' },
                  { l: 'Mule Account Recoverable', v: activeCase.recoverable_amount,  c: '#34D399' },
                  { l: 'Estimated Net Loss',     v: Math.max(0, (activeCase.total_fraud_amount || 0) - (activeCase.recoverable_amount || 0)), c: '#FBBF24' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <span className="text-[10px] font-mono text-slate-400">{row.l}</span>
                    <span className="text-[12px] font-mono font-bold" style={{ color: row.c }}>
                      ₹{Number(row.v || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Flow Path */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-600">
                  Suspect Chain Trajectory ({activeCase.hops} Hops)
                </span>
                <span className="text-[9px] font-mono text-blue-400">{activeCase.chain.length} Nodes</span>
              </div>
              <div className="space-y-1.5 mt-2">
                {activeCase.chain.map((acc, i) => {
                  const isOrigin = i === 0;
                  const isDestination = i === activeCase.chain.length - 1;
                  return (
                    <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-[#0F1926] border border-[#1A2640]">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isOrigin ? 'bg-blue-400' : isDestination ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span className="text-[10px] font-mono text-slate-300 font-medium truncate flex-1">{acc}</span>
                      <span className={`text-[8px] font-mono px-1 py-0.5 rounded border uppercase ${
                        isOrigin ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        isDestination ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {isOrigin ? 'VICTIM' : isDestination ? 'TERMINAL' : `MULE #${i}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent Actions & Interventions */}
            {selectedActions.length > 0 && (
              <div className="p-4 space-y-2">
                <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-600">
                  Automated Interventions ({selectedActions.length})
                </div>
                <div className="space-y-1.5">
                  {selectedActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-[#0F1926] border border-[#1A2640]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono font-bold text-slate-200">{action.action_type || 'FREEZE_ACCOUNT'}</div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5">{action.target_account || action.description || 'Target account restricted'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-[340px] shrink-0 flex flex-col items-center justify-center bg-[#060B14] border-l border-[#1A2640] gap-3 text-center px-6">
          <div className="w-10 h-10 rounded bg-[#0F1926] border border-[#1A2640] flex items-center justify-center">
            <Layers className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">Select a Case for Triage</div>
            <div className="text-[9px] font-mono text-slate-600 mt-1 max-w-[200px]">
              Click any row to inspect money flow trajectory, recovery potential, and enforcement actions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;
