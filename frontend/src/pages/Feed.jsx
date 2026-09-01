import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import RiskBadge from '../components/RiskBadge';
import InvestigationSidebar from '../components/InvestigationSidebar';
import { getRole } from '../roleStore';
import { maskAccount } from '../utils/maskAccount';
import { Activity, Zap, AlertTriangle, ArrowRight, Search, Filter, Radio, RefreshCw } from 'lucide-react';

const Feed = () => {
  const { transactions, cases, actions, connectionStatus } = useWebSocket();
  const [sidebarState, setSidebarState] = useState({ isOpen: false, tx: null, case: null, actions: [] });
  const [newTxIds, setNewTxIds] = useState(new Set());
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const previousTxIdsRef = useRef(new Set());
  const role = getRole();

  useEffect(() => {
    if (transactions.length === 0) return;
    const currentIds = new Set(transactions.map((t) => t.tx_id));
    const newlyArrived = new Set();
    currentIds.forEach((id) => {
      if (!previousTxIdsRef.current.has(id)) newlyArrived.add(id);
    });

    if (newlyArrived.size > 0 && previousTxIdsRef.current.size > 0) {
      setNewTxIds((prev) => new Set([...prev, ...newlyArrived]));
      const timer = setTimeout(() => {
        setNewTxIds((prev) => {
          const next = new Set(prev);
          newlyArrived.forEach((id) => next.delete(id));
          return next;
        });
      }, 1800);
      return () => clearTimeout(timer);
    }
    previousTxIdsRef.current = currentIds;
  }, [transactions]);

  const totalTransactions = transactions.length;
  const totalAtRiskAmount = useMemo(() => cases.reduce((sum, c) => sum + (c.total_fraud_amount || 0), 0), [cases]);
  const now = Date.now();
  const txPerMin = useMemo(() => transactions.filter(tx => now - new Date(tx.timestamp).getTime() < 60000).length, [transactions, now]);
  const criticalCount = useMemo(() => transactions.filter(tx => (tx.risk_score || 0) >= 85).length, [transactions]);

  // Clean anomaly reason representation avoiding fake repeating patterns
  const getAnomalyText = (tx) => {
    const score = tx.risk_score || 0;
    if (score < 40) {
      return <span className="text-slate-600 italic text-[10px]">Routine clearing</span>;
    }
    if (tx.reason) {
      return (
        <span className={`text-[10px] truncate block ${score >= 85 ? 'text-rose-400 font-medium' : score >= 70 ? 'text-orange-400 font-medium' : 'text-amber-400/90'}`} title={tx.reason}>
          {tx.reason}
        </span>
      );
    }
    if (score >= 85) return <span className="text-rose-400 font-medium text-[10px]">High-velocity burst + Rapid pass-through</span>;
    if (score >= 70) return <span className="text-orange-400 font-medium text-[10px]">Unusual counterparty + Velocity jump</span>;
    return <span className="text-amber-400 text-[10px]">Off-hours threshold deviation</span>;
  };

  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter(tx => {
        if (channelFilter !== 'ALL' && tx.channel !== channelFilter) return false;
        if (riskFilter === 'CRITICAL' && (tx.risk_score || 0) < 85) return false;
        if (riskFilter === 'HIGH' && (tx.risk_score || 0) < 70) return false;
        if (riskFilter === 'FLAGGED' && (tx.risk_score || 0) < 40 && !tx.reason) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchId = (tx.tx_id || '').toLowerCase().includes(q);
          const matchSender = (tx.sender_account || '').toLowerCase().includes(q);
          const matchReceiver = (tx.receiver_account || '').toLowerCase().includes(q);
          const matchReason = (tx.reason || '').toLowerCase().includes(q);
          if (!matchId && !matchSender && !matchReceiver && !matchReason) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 150);
  }, [transactions, channelFilter, riskFilter, searchQuery]);

  const formatTime = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? String(isoString).slice(0, 8) : date.toLocaleTimeString('en-IN', { hour12: false });
  };

  const handleRowClick = (tx) => {
    const relatedCase = cases.find(c => c.case_id === tx.case_id);
    const relatedActions = actions.filter(a => a.case_id === tx.case_id);
    setSidebarState({ isOpen: true, tx, case: relatedCase, actions: relatedActions });
  };

  return (
    <div className="flex flex-col h-full bg-[#080D18] overflow-hidden">

      {/* ── Stat Strip ── */}
      <div className="flex items-stretch border-b border-[#1A2640] bg-[#040810] shrink-0 overflow-x-auto">
        <div className="flex items-center gap-3 px-4 py-2.5 border-r border-[#1A2640] shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div>
            <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-600">Pipeline Status</div>
            <div className="text-[11px] font-mono font-bold text-emerald-400 leading-tight">LIVE INGESTION</div>
          </div>
        </div>
        {[
          { label: 'Total Processed', value: totalTransactions, unit: 'TX', color: '#E2E8F0' },
          { label: 'Velocity', value: txPerMin, unit: 'TX/MIN', color: '#60A5FA' },
          { label: 'Critical Alerts', value: criticalCount, unit: 'FLAGS', color: '#F87171' },
          { label: 'At-Risk Exposure', value: `₹${totalAtRiskAmount.toLocaleString('en-IN')}`, unit: '', color: '#FBBF24' },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col justify-center px-5 py-2 border-r border-[#1A2640] shrink-0">
            <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-600">{stat.label}</div>
            <div className="text-[14px] font-mono font-bold leading-tight" style={{ color: stat.color }}>
              {stat.value}{stat.unit && <span className="text-[9px] font-normal text-slate-600 ml-1">{stat.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1A2640] bg-[#06091180] shrink-0 flex-wrap">
        {/* Channel chips */}
        <div className="flex items-center gap-0.5">
          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-600 mr-2">Channel</span>
          {['ALL', 'UPI', 'IMPS', 'NEFT', 'CARD'].map(ch => (
            <button key={ch} onClick={() => setChannelFilter(ch)}
              className={`s-chip ${channelFilter === ch ? 's-chip-active' : ''}`}
            >{ch}</button>
          ))}
        </div>
        <div className="w-px h-4 bg-[#1A2640] mx-1" />
        {/* Risk chips */}
        <div className="flex items-center gap-0.5">
          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-600 mr-2">Severity</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CRITICAL', label: 'Critical ≥85' },
            { id: 'HIGH', label: 'High ≥70' },
            { id: 'FLAGGED', label: 'Flagged' },
          ].map(r => (
            <button key={r.id} onClick={() => setRiskFilter(r.id)}
              className={`s-chip ${riskFilter === r.id ? 's-chip-active' : ''}`}
            >{r.label}</button>
          ))}
        </div>
        {/* Search */}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by account, ID, flag..."
            className="s-input pl-7 w-52"
          />
        </div>
        {/* Result count */}
        <span className="text-[9px] font-mono text-slate-600 ml-2 whitespace-nowrap">
          {filteredTransactions.length} rows
        </span>
      </div>

      {/* ── Table — edge-to-edge ── */}
      <div className="flex-1 overflow-auto bg-[#080D18]">
        {filteredTransactions.length > 0 ? (
          <table className="s-table w-full min-w-[900px]">
            <thead>
              <tr>
                <th style={{ width: 28 }} />
                <th>TX ID</th>
                <th>Time</th>
                <th>Channel</th>
                <th>Originator → Beneficiary</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Assessed Risk</th>
                <th>Anomaly Indicator</th>
                <th>Case</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const isNew = newTxIds.has(tx.tx_id);
                const score = tx.risk_score || 0;
                const isCritical = score >= 85;
                const isHigh = score >= 70 && !isCritical;
                const isFlagged = tx.regulatory_flagged || tx.reason || score >= 40;
                const priorityClass = isCritical ? 's-priority-critical' : isHigh ? 's-priority-high' : isFlagged ? 's-priority-medium' : 's-priority-none';

                return (
                  <tr
                    key={tx.tx_id}
                    onClick={() => handleRowClick(tx)}
                    className={`${priorityClass} ${isNew ? 'animate-row-arrive bg-blue-500/10' : ''} ${isCritical ? 'bg-rose-950/10' : ''}`}
                  >
                    {/* Priority dot */}
                    <td className="text-center px-2">
                      {isCritical && <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />}
                      {isHigh && <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500" />}
                      {isFlagged && !isCritical && !isHigh && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    </td>

                    {/* TX ID */}
                    <td className="font-bold text-slate-200">
                      {role === 'admin' ? tx.tx_id : '••••••••'}
                    </td>

                    {/* Time */}
                    <td className="text-slate-500 text-[10px]">{formatTime(tx.timestamp)}</td>

                    {/* Channel */}
                    <td>
                      <span className="inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-sm bg-[#0F1926] text-slate-400 border border-[#1A2640] uppercase tracking-wider">
                        {tx.channel || 'UPI'}
                      </span>
                    </td>

                    {/* Accounts */}
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">{role === 'admin' ? tx.sender_account : maskAccount(tx.sender_account)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                        <span className="text-blue-400 font-medium">{role === 'admin' ? tx.receiver_account : maskAccount(tx.receiver_account)}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="text-right font-bold text-slate-100 tabular-nums">
                      ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Risk Score */}
                    <td className="text-center"><RiskBadge score={tx.risk_score} /></td>

                    {/* Anomaly Reason */}
                    <td className="max-w-[280px]">
                      {getAnomalyText(tx)}
                    </td>

                    {/* Case link */}
                    <td>
                      {tx.case_id ? (
                        <span className="text-blue-400/80 text-[10px] font-mono hover:underline">
                          {String(tx.case_id).slice(-8)}
                        </span>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-24">
            <div className="w-12 h-12 rounded bg-blue-600/8 border border-blue-500/15 flex items-center justify-center">
              <Radio className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[12px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                {searchQuery || channelFilter !== 'ALL' || riskFilter !== 'ALL' ? 'No Matching Transactions' : 'Monitoring Payment Networks'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                {searchQuery || channelFilter !== 'ALL' || riskFilter !== 'ALL' ? (
                  <button onClick={() => { setSearchQuery(''); setChannelFilter('ALL'); setRiskFilter('ALL'); }} className="text-blue-400 hover:underline">
                    Reset all filters
                  </button>
                ) : (
                  `WebSocket Link: ${connectionStatus} · Awaiting Clearing Network Events`
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investigation Inspector Drawer */}
      <InvestigationSidebar
        isOpen={sidebarState.isOpen}
        selectedTransaction={sidebarState.tx}
        selectedCase={sidebarState.case ? cases.find(c => c.case_id === sidebarState.case.case_id) : null}
        actions={sidebarState.case ? actions.filter(a => a.case_id === sidebarState.case.case_id) : []}
        onClose={() => setSidebarState({ ...sidebarState, isOpen: false })}
        role={role}
      />
    </div>
  );
};

export default Feed;
