import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import RiskBadge from '../components/RiskBadge';
import { getRole } from '../roleStore';
import { Network, Search, Clock, AlertTriangle, ShieldCheck, ArrowRight, X, ExternalLink } from 'lucide-react';

const Cases = () => {
  const navigate = useNavigate();
  const { cases, actions, transactions } = useWebSocket();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const role = getRole();

  const ALL_STATUSES = ['ALL', 'NEW', 'HIGH_RISK', 'ACTIONED', 'MONITORING', 'CLOSED'];

  const totalFraudExposure = useMemo(() => cases.reduce((sum, c) => sum + (c.total_fraud_amount || 0), 0), [cases]);
  const totalRecoverable = useMemo(() => cases.reduce((sum, c) => sum + (c.recoverable_amount || 0), 0), [cases]);
  const criticalCount = useMemo(() => cases.filter(c => (c.risk_level || 0) >= 80).length, [cases]);
  const actionedCount = useMemo(() => cases.filter(c => c.status === 'ACTIONED').length, [cases]);

  const filteredCases = useMemo(() => {
    return [...cases]
      .filter(c => {
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (riskFilter === 'CRITICAL' && (c.risk_level || 0) < 80) return false;
        if (riskFilter === 'HIGH' && (c.risk_level || 0) < 60) return false;
        if (riskFilter === 'MEDIUM' && (c.risk_level || 0) >= 60) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!(c.case_id || '').toLowerCase().includes(q) &&
              !(c.primary_tx_id || '').toLowerCase().includes(q) &&
              !(c.chain || []).some(acc => acc.toLowerCase().includes(q))) return false;
        }
        return true;
      })
      .sort((a, b) => (b.risk_level || 0) - (a.risk_level || 0));
  }, [cases, statusFilter, riskFilter, searchQuery]);

  const getPriorityClass = (score) => {
    if (score >= 80) return 's-priority-critical';
    if (score >= 60) return 's-priority-high';
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

  const selectedActions = selectedCase ? actions.filter(a => a.case_id === selectedCase.case_id) : [];
  const selectedTx = selectedCase ? transactions.find(t => t.case_id === selectedCase.case_id) : null;

  return (
    <div className="flex h-full bg-[#080D18] overflow-hidden">

      {/* ── LEFT: Triage Queue ── */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-[#1A2640]">

        {/* Stat strip */}
        <div className="flex items-stretch border-b border-[#1A2640] bg-[#040810] shrink-0">
          {[
            { label: 'Total Cases',       value: cases.length,                        color: '#E2E8F0' },
            { label: 'Critical',          value: criticalCount,                       color: '#F87171' },
            { label: 'Actioned',          value: actionedCount,                       color: '#34D399' },
            { label: 'Fraud Exposure',    value: `₹${totalFraudExposure.toLocaleString('en-IN')}`, color: '#FBBF24' },
            { label: 'Recoverable',       value: `₹${totalRecoverable.toLocaleString('en-IN')}`,  color: '#60A5FA' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col justify-center px-4 py-2.5 border-r border-[#1A2640]">
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700">{stat.label}</div>
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
            {[{id:'ALL',l:'All Risk'},{id:'CRITICAL',l:'Critical'},{id:'HIGH',l:'High'},{id:'MEDIUM',l:'Medium'}].map(r => (
              <button key={r.id} onClick={() => setRiskFilter(r.id)}
                className={`s-chip ${riskFilter === r.id ? 's-chip-active' : ''}`}
              >{r.l}</button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-700" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search case ID, account..." className="s-input pl-6 w-44" />
          </div>
          <span className="text-[9px] font-mono text-slate-700">{filteredCases.length} cases</span>
        </div>

        {/* Case table */}
        <div className="flex-1 overflow-auto">
          <table className="s-table w-full min-w-[550px]">
            <thead>
              <tr>
                <th style={{ width: 6 }} className="p-0" />
                <th>Case ID</th>
                <th>Status</th>
                <th className="text-center">Risk</th>
                <th className="text-right">Exposure</th>
                <th>Chain Accounts</th>
                <th>Window</th>
                <th className="text-center">Graph</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => {
                const score = c.risk_level || 0;
                const isSelected = selectedCase?.case_id === c.case_id;
                return (
                  <tr
                    key={c.case_id}
                    onClick={() => setSelectedCase(c)}
                    className={`${getPriorityClass(score)} transition-colors ${isSelected ? 'bg-blue-500/8 !border-l-blue-400' : ''}`}
                  >
                    <td className="p-0 w-1.5" />
                    <td className="font-bold text-slate-200 text-[11px]">
                      {String(c.case_id || '').slice(-8)}
                    </td>
                    <td>
                      <span className={`s-pill border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="text-center"><RiskBadge score={c.risk_level} /></td>
                    <td className="text-right font-bold text-slate-100">
                      ₹{Number(c.total_fraud_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="text-slate-500 text-[10px]">
                      {Array.isArray(c.chain) ? `${c.chain.length} accounts` : '—'}
                    </td>
                    <td className="text-slate-500 text-[10px]">
                      {c.golden_window_minutes ? `${c.golden_window_minutes}m` : '—'}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/graph/${c.case_id}`); }}
                        className="p-1 rounded text-slate-700 hover:text-blue-400 hover:bg-blue-500/8 transition-colors"
                        title="Open Graph Investigation"
                      >
                        <Network className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-700 text-[11px] font-mono py-12">
                    No cases match current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RIGHT: Case Inspector Panel ── */}
      {selectedCase ? (
        <div className="w-[380px] shrink-0 flex flex-col bg-[#060B14] border-l border-[#1A2640] overflow-hidden animate-fade-in">
          {/* Inspector header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A2640] shrink-0 bg-[#040810]">
            <div>
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700">Case Inspector</div>
              <div className="text-[11px] font-mono font-bold text-slate-200 mt-0.5">
                {String(selectedCase.case_id || '').slice(-12)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(`/graph/${selectedCase.case_id}`)}
                className="flex items-center gap-1.5 s-btn-ghost text-[9px]">
                <Network className="w-3 h-3" /> Graph
              </button>
              <button onClick={() => setSelectedCase(null)} className="p-1 rounded text-slate-600 hover:text-slate-300 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {/* Risk & Status */}
            <div className="px-4 py-3 border-b border-[#1A2640]">
              <div className="flex items-center justify-between mb-3">
                <RiskBadge score={selectedCase.risk_level} />
                <span className={`s-pill border ${getStatusBadge(selectedCase.status)}`}>{selectedCase.status}</span>
              </div>
              {/* Risk bar */}
              <div className="s-progress">
                <div className="s-progress-fill" style={{
                  width: `${selectedCase.risk_level || 0}%`,
                  background: (selectedCase.risk_level || 0) >= 80 ? '#EF4444' : (selectedCase.risk_level || 0) >= 60 ? '#F97316' : '#F59E0B'
                }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] font-mono text-slate-700">Risk Level</span>
                <span className="text-[9px] font-mono font-bold text-slate-400">{selectedCase.risk_level || 0}/100</span>
              </div>
            </div>

            {/* Financial metrics */}
            <div className="px-4 py-3 border-b border-[#1A2640]">
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700 mb-2">Financial Exposure</div>
              <div className="space-y-2">
                {[
                  { l: 'Fraud Amount',   v: selectedCase.total_fraud_amount,  c: '#F87171' },
                  { l: 'Recoverable',    v: selectedCase.recoverable_amount,  c: '#34D399' },
                  { l: 'Estimated Loss', v: Math.max(0, (selectedCase.total_fraud_amount||0)-(selectedCase.recoverable_amount||0)), c: '#FBBF24' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-baseline">
                    <span className="text-[10px] font-mono text-slate-600">{row.l}</span>
                    <span className="text-[12px] font-mono font-bold" style={{ color: row.c }}>
                      ₹{Number(row.v || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction chain */}
            {Array.isArray(selectedCase.chain) && selectedCase.chain.length > 0 && (
              <div className="px-4 py-3 border-b border-[#1A2640]">
                <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700 mb-2">
                  Account Chain ({selectedCase.chain.length})
                </div>
                <div className="space-y-1">
                  {selectedCase.chain.slice(0, 6).map((acc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 shrink-0" />
                      <span className="text-[10px] font-mono text-slate-400 truncate">{acc}</span>
                      {i === 0 && <span className="text-[8px] font-mono text-emerald-600 ml-auto">ORIGIN</span>}
                    </div>
                  ))}
                  {selectedCase.chain.length > 6 && (
                    <div className="text-[9px] font-mono text-slate-700 pl-3.5">+{selectedCase.chain.length - 6} more</div>
                  )}
                </div>
              </div>
            )}

            {/* Risk factors */}
            {selectedCase.risk_factors && (
              <div className="px-4 py-3 border-b border-[#1A2640]">
                <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700 mb-2">Risk Factors</div>
                <div className="space-y-1">
                  {(Array.isArray(selectedCase.risk_factors) ? selectedCase.risk_factors : []).slice(0,5).map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 text-amber-500/60 shrink-0 mt-0.5" />
                      <span className="text-[10px] font-mono text-slate-400">
                        {typeof f === 'string' ? f : (f.name || f.description || JSON.stringify(f))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agent actions */}
            {selectedActions.length > 0 && (
              <div className="px-4 py-3">
                <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700 mb-2">
                  AI Agent Actions ({selectedActions.length})
                </div>
                <div className="space-y-1.5">
                  {selectedActions.slice(0, 5).map((action, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px] font-mono text-slate-500">
                      <ShieldCheck className="w-3 h-3 text-emerald-500/50 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{action.action_type || action.description || 'Agent action'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-[300px] shrink-0 flex flex-col items-center justify-center bg-[#060B14] border-l border-[#1A2640] gap-3 text-center px-6">
          <div className="w-8 h-8 rounded bg-[#0F1926] border border-[#1A2640] flex items-center justify-center">
            <Network className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider">Select a case</div>
            <div className="text-[9px] font-mono text-slate-800 mt-1">Click any row to open the case inspector</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;
