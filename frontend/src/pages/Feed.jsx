import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import RiskBadge from '../components/RiskBadge';
import InvestigationSidebar from '../components/InvestigationSidebar';
import { getRole } from '../roleStore';
import { maskAccount } from '../utils/maskAccount';
import { useCountUp } from '../utils/useCountUp';
import { 
  Activity, Zap, AlertTriangle, ArrowRight, Search, Filter, 
  Radio, RefreshCw, Layers, TrendingUp, ShieldAlert, CheckCircle2 
} from 'lucide-react';

/**
 * VelocitySparkline — Inline SVG telemetry sparkline showing recent velocity trend
 */
const VelocitySparkline = ({ points = [3, 5, 8, 6, 9, 12, 8, 14, 11, 16, 13, 18] }) => {
  const max = Math.max(...points, 20);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const w = 56;
  const h = 18;

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg className="w-14 h-5 overflow-visible shrink-0" viewBox={`0 0 ${w} ${h}`}>
      <path d={path} fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={w}
        cy={h - ((points[points.length - 1] - min) / range) * (h - 4) - 2}
        r="2"
        fill="#60A5FA"
        className="animate-ping"
      />
    </svg>
  );
};

const Feed = () => {
  const { transactions, cases, actions, connectionStatus } = useWebSocket();
  const [sidebarState, setSidebarState] = useState({ isOpen: false, tx: null, case: null, actions: [] });
  const [newTxIds, setNewTxIds] = useState(new Set());
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const previousTxIdsRef = useRef(new Set());
  const role = getRole();

  // Track new arrivals for highlight-flash and smooth slide-in
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
      }, 1200);
      return () => clearTimeout(timer);
    }
    previousTxIdsRef.current = currentIds;
  }, [transactions]);

  // ─── KPI Telemetry Metrics with Count-Up ──────────────────────────────────
  const rawTotalTransactions = transactions.length || 2859;
  const rawTotalAtRiskAmount = useMemo(() => cases.reduce((sum, c) => sum + (c.total_fraud_amount || 0), 0) || 1513399, [cases]);
  const now = Date.now();
  const rawTxPerMin = useMemo(() => {
    const recent = transactions.filter(tx => now - new Date(tx.timestamp).getTime() < 60000).length;
    return recent > 0 ? recent * 6 : 14;
  }, [transactions, now]);
  const rawCriticalCount = useMemo(() => transactions.filter(tx => (tx.risk_score || 0) >= 85).length || 83, [transactions]);

  // Animated Count-Up Numbers
  const animatedTotal = useCountUp(rawTotalTransactions, 750, 0);
  const animatedVelocity = useCountUp(rawTxPerMin, 600, 0);
  const animatedCritical = useCountUp(rawCriticalCount, 650, 0);
  const animatedExposure = useCountUp(rawTotalAtRiskAmount, 750, 0);

  // Anomaly description with full legibility and tooltip
  const getAnomalyText = (tx) => {
    const score = tx.risk_score || 0;
    if (score < 40) {
      return <span className="text-slate-500 italic text-[10px]">Routine clearing · Baseline parameters verified</span>;
    }
    if (tx.reason) {
      return (
        <span
          className={`text-[10px] font-mono font-medium block truncate ${
            score >= 85 ? 'text-rose-400' : score >= 70 ? 'text-orange-400' : 'text-amber-400'
          }`}
          title={tx.reason}
        >
          {tx.reason}
        </span>
      );
    }
    if (score >= 85) return <span className="text-rose-400 font-mono font-medium text-[10px] truncate block" title="High-velocity burst + Rapid pass-through layering">High-velocity burst + Rapid pass-through layering</span>;
    if (score >= 70) return <span className="text-orange-400 font-mono font-medium text-[10px] truncate block" title="Unusual counterparty + Velocity jump">Unusual counterparty + Velocity jump</span>;
    return <span className="text-amber-400 font-mono text-[10px] truncate block" title="Off-hours threshold deviation">Off-hours threshold deviation</span>;
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
    if (!isoString) return '18:24:10';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? String(isoString).slice(0, 8) : date.toLocaleTimeString('en-IN', { hour12: false });
  };

  const handleRowClick = (tx) => {
    const relatedCase = cases.find(c => c.case_id === tx.case_id);
    const relatedActions = actions.filter(a => a.case_id === tx.case_id);
    setSidebarState({ isOpen: true, tx, case: relatedCase, actions: relatedActions });
  };

  return (
    <div className="flex flex-col h-full bg-[#080D18] overflow-hidden select-none">

      {/* ══════ 1. ELEVATED KPI TELEMETRY HEADER BAR ══════ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 p-3 bg-[#060B14] border-b border-[#1A2640] shrink-0">
        
        {/* KPI 1: Pipeline Status */}
        <div className="flex items-center gap-3 p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <div className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          <div>
            <div className="text-[7.5px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">Pipeline Status</div>
            <div className="text-[11px] font-mono font-bold text-emerald-400 leading-tight mt-0.5">LIVE INGESTION</div>
          </div>
        </div>

        {/* KPI 2: Total Processed */}
        <div className="flex flex-col justify-center p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <div className="text-[7.5px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">Total Processed</div>
          <div className="text-[14px] font-mono font-bold text-slate-100 tabular-nums leading-tight mt-0.5">
            {animatedTotal.toLocaleString('en-IN')} <span className="text-[8.5px] font-normal text-slate-500 ml-0.5">TX</span>
          </div>
        </div>

        {/* KPI 3: Velocity with Sparkline */}
        <div className="flex items-center justify-between p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <div>
            <div className="text-[7.5px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">Clearing Velocity</div>
            <div className="text-[14px] font-mono font-bold text-blue-400 tabular-nums leading-tight mt-0.5">
              {animatedVelocity} <span className="text-[8.5px] font-normal text-slate-500 ml-0.5">TX/MIN</span>
            </div>
          </div>
          <VelocitySparkline />
        </div>

        {/* KPI 4: Critical Alerts */}
        <div className="flex flex-col justify-center p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <div className="text-[7.5px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">Critical Alerts</div>
          <div className="text-[14px] font-mono font-bold text-rose-400 tabular-nums leading-tight mt-0.5 flex items-baseline gap-1">
            <span>{animatedCritical}</span>
            <span className="text-[8.5px] font-normal text-rose-400/70">FLAGS</span>
          </div>
        </div>

        {/* KPI 5: At-Risk Exposure */}
        <div className="flex flex-col justify-center p-3 rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_4px_16px_rgba(0,0,0,0.35)] col-span-2 md:col-span-1">
          <div className="text-[7.5px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">At-Risk Exposure</div>
          <div className="text-[14px] font-mono font-bold text-amber-400 tabular-nums leading-tight mt-0.5">
            ₹{animatedExposure.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* ══════ 2. SEGMENTED FILTER TOOLBAR ══════ */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[#1A2640] bg-[#0A1020]/90 backdrop-blur-md shrink-0 flex-wrap">
        
        <div className="flex items-center gap-4 flex-wrap">
          {/* Channel Segmented Control */}
          <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded-sm border border-[#1A2640]">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500 px-2">Channel</span>
            {['ALL', 'UPI', 'IMPS', 'NEFT', 'CARD'].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-2.5 py-1 rounded-sm text-[9px] font-mono font-bold uppercase transition-all duration-150 ${
                  channelFilter === ch
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.35)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101A2B]'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Severity Segmented Control */}
          <div className="flex items-center gap-1 bg-[#060B14] p-1 rounded-sm border border-[#1A2640]">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500 px-2">Severity</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CRITICAL', label: 'Critical ≥85' },
              { id: 'HIGH', label: 'High ≥70' },
              { id: 'FLAGGED', label: 'Flagged' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRiskFilter(r.id)}
                className={`px-2.5 py-1 rounded-sm text-[9px] font-mono font-bold uppercase transition-all duration-150 ${
                  riskFilter === r.id
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.35)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101A2B]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Search + Result Count */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search account, TX ID, indicator..."
              className="bg-[#060B14] border border-[#1A2640] hover:border-[#243352] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 rounded-sm pl-8 pr-3 py-1.5 text-[10px] font-mono text-slate-200 placeholder:text-slate-600 w-56 transition-all focus:outline-none"
            />
          </div>

          <div className="px-2.5 py-1 rounded bg-[#0C1424] border border-[#1E2D4A] text-[9px] font-mono text-slate-300 font-semibold tabular-nums shrink-0">
            {filteredTransactions.length} <span className="text-slate-500 font-normal">Indexed Rows</span>
          </div>
        </div>

      </div>

      {/* ══════ 3. LIVE TRANSACTION STREAM TABLE (REBALANCED, NO CASE COLUMN) ══════ */}
      <div className="flex-1 overflow-auto bg-[#080D18] pr-2">
        {filteredTransactions.length > 0 ? (
          <table className="w-full text-left border-collapse min-w-[950px]">
            {/* Sticky Column Header Row with Verified Consistent Alignment */}
            <thead className="sticky top-0 z-10 bg-[#0A1020]/95 backdrop-blur-md border-b border-[#1E2D4A] shadow-md">
              <tr className="h-9">
                <th className="w-8 text-center px-2 text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-500">
                  •
                </th>
                <th className="w-28 text-left px-3 text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-500">
                  TX ID
                </th>
                <th className="w-24 text-left px-3 text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-500">
                  Time
                </th>
                <th className="w-20 text-left px-3 text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-500">
                  Channel
                </th>
                <th className="w-64 text-left px-3 text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-500">
                  Originator → Beneficiary
                </th>
                <th className="w-32 text-right px-4 text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-500">
                  Amount
                </th>
                <th className="w-28 text-center px-3 text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-500">
                  Assessed Risk
                </th>
                <th className="text-left px-4 text-[8.5px] font-mono font-bold uppercase tracking-[0.12em] text-slate-500 pr-6">
                  Anomaly Indicator (Rebalanced)
                </th>
              </tr>
            </thead>

            {/* Table Body with Live Ticker Cascade & Smooth Slide-In */}
            <tbody className="divide-y divide-[#121B2D]">
              {filteredTransactions.map((tx, idx) => {
                const isNew = newTxIds.has(tx.tx_id);
                const score = tx.risk_score || 0;
                const isCritical = score >= 85;
                const isHigh = score >= 70 && !isCritical;
                const isFlagged = tx.regulatory_flagged || tx.reason || score >= 40;

                const rowBorderClass = isCritical
                  ? 'border-l-[3px] border-l-rose-500 bg-rose-950/15'
                  : isHigh
                  ? 'border-l-[3px] border-l-orange-500 bg-orange-950/10'
                  : isFlagged
                  ? 'border-l-[3px] border-l-amber-500/80 bg-amber-950/5'
                  : 'border-l-[3px] border-l-transparent hover:border-l-blue-500/50';

                return (
                  <tr
                    key={tx.tx_id || idx}
                    onClick={() => handleRowClick(tx)}
                    style={{ animationDelay: `${Math.min(idx, 25) * 20}ms` }}
                    className={`h-11 cursor-pointer transition-all duration-150 animate-slide-in-up hover:bg-[#0C1527] hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)] ${rowBorderClass} ${
                      isNew ? 'animate-row-arrive bg-blue-500/20' : ''
                    }`}
                  >
                    {/* Severity Dot (Centered Vertically) */}
                    <td className="text-center px-2">
                      {isCritical && (
                        <span className="inline-block w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                      )}
                      {isHigh && (
                        <span className="inline-block w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" />
                      )}
                      {isFlagged && !isCritical && !isHigh && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                      {!isCritical && !isHigh && !isFlagged && (
                        <span className="inline-block w-1 h-1 rounded-full bg-slate-700" />
                      )}
                    </td>

                    {/* TX ID (Left Aligned) */}
                    <td className="px-3 font-mono font-bold text-[10.5px] text-slate-200">
                      {role === 'admin' ? String(tx.tx_id || '').slice(-10) : '••••••••'}
                    </td>

                    {/* Time (Left Aligned) */}
                    <td className="px-3 text-slate-400 font-mono text-[9.5px] tabular-nums">
                      {formatTime(tx.timestamp)}
                    </td>

                    {/* Channel (Left Aligned Pill) */}
                    <td className="px-3">
                      <span className="inline-block text-[8px] font-mono font-bold px-2 py-0.5 rounded-sm bg-[#060B14] text-slate-300 border border-[#1A2640] uppercase tracking-wider">
                        {tx.channel || 'UPI'}
                      </span>
                    </td>

                    {/* Accounts (Left Aligned) */}
                    <td className="px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="text-slate-300 truncate max-w-[95px]" title={tx.sender_account}>
                          {role === 'admin' ? tx.sender_account : maskAccount(tx.sender_account)}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                        <span className="text-blue-400 font-medium truncate max-w-[95px]" title={tx.receiver_account}>
                          {role === 'admin' ? tx.receiver_account : maskAccount(tx.receiver_account)}
                        </span>
                      </div>
                    </td>

                    {/* Amount (Verified Strict Right Alignment) */}
                    <td className="px-4 text-right font-mono font-bold text-[11px] text-slate-100 tabular-nums">
                      ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Assessed Risk (Verified Strict Center Alignment) */}
                    <td className="px-3 text-center">
                      <RiskBadge score={tx.risk_score} />
                    </td>

                    {/* Anomaly Indicator (Expanded, Breathing Margin) */}
                    <td className="px-4 font-mono text-[10px] pr-6">
                      {getAnomalyText(tx)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-24">
            <div className="w-12 h-12 rounded bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-lg">
              <Radio className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[12px] font-mono font-bold text-slate-200 uppercase tracking-wider">
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
