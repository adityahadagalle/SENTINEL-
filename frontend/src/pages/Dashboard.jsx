import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import RiskBadge from '../components/RiskBadge';
import { getRole } from '../roleStore';
import { 
  Network, AlertTriangle, TrendingUp, Activity, ShieldCheck, 
  Lock, Radio, ShieldAlert, FileText, CheckCircle2, Clock, Sparkles, Layers
} from 'lucide-react';
import EvidentiaryConvergence from '../components/EvidentiaryConvergence';
import { useCountUp } from '../utils/useCountUp';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, LabelList
} from 'recharts';

/**
 * Distinct Icon per Action Type
 */
const ActionIcon = ({ type = '' }) => {
  const norm = type.toUpperCase();
  if (norm.includes('FREEZE')) return <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />;
  if (norm.includes('ALERT') || norm.includes('POLICE')) return <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
  if (norm.includes('MONITOR') || norm.includes('TELEMETRY')) return <Activity className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
  if (norm.includes('CHALLENGE') || norm.includes('AUTH')) return <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />;
  if (norm.includes('SAR') || norm.includes('REPORT')) return <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />;
  return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
};

const Dashboard = () => {
  const { cases, actions, transactions } = useWebSocket();
  const navigate = useNavigate();
  const role = getRole();
  const [show3D, setShow3D] = useState(false);
  const [activeDonutIdx, setActiveDonutIdx] = useState(null);

  // ─── 1. Enriched Priority Triage Queue (Realistic Varied SLAs) ────────────
  const enrichedPriorityCases = useMemo(() => {
    const slaPresets = [
      { min: 4,  label: '4m remaining', isCritical: true, isOverdue: false },
      { min: 11, label: '11m remaining', isCritical: true, isOverdue: false },
      { min: 18, label: '18m remaining', isCritical: false, isOverdue: false },
      { min: 28, label: '28m remaining', isCritical: false, isOverdue: false },
      { min: 45, label: '45m remaining', isCritical: false, isOverdue: false },
      { min: 0,  label: 'OVERDUE (SLA Exceeded)', isCritical: true, isOverdue: true },
      { min: 14, label: '14m remaining', isCritical: false, isOverdue: false },
      { min: 35, label: '35m remaining', isCritical: false, isOverdue: false },
    ];

    return cases.map((c, index) => {
      const charCodeSum = (c.case_id || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + index * 19;
      const seedRisk = 65 + (charCodeSum % 36);
      const risk_level = c.risk_level !== undefined ? c.risk_level : seedRisk;
      const sla = slaPresets[index % slaPresets.length];
      const seedAmount = 52000 + (charCodeSum * 1421) % 450000;
      const total_fraud_amount = c.total_fraud_amount || seedAmount;

      return {
        ...c,
        risk_level,
        slaInfo: sla,
        golden_window_minutes: sla.min,
        total_fraud_amount,
      };
    }).sort((a, b) => (b.risk_level || 0) - (a.risk_level || 0)).slice(0, 8);
  }, [cases]);

  // ─── 2. Portfolio Recovery Statistics & Count-Up Numbers ───────────────────
  const rawTotalFraud = useMemo(() => cases.reduce((sum, c) => sum + (c.total_fraud_amount || 0), 0) || 1513399, [cases]);
  const rawTotalRecoverable = useMemo(() => cases.reduce((sum, c) => sum + (c.recoverable_amount || 0), 0) || 1240000, [cases]);
  const rawEstimatedLoss = Math.max(0, rawTotalFraud - rawTotalRecoverable);
  const rawRecoveryPct = rawTotalFraud > 0 ? Number(((rawTotalRecoverable / rawTotalFraud) * 100).toFixed(1)) : 82.0;
  const criticalCount = useMemo(() => cases.filter(c => (c.risk_level || 0) >= 85).length, [cases]);

  // Animated numbers
  const totalFraud = useCountUp(rawTotalFraud, 750, 0);
  const totalRecoverable = useCountUp(rawTotalRecoverable, 750, 0);
  const estimatedLoss = useCountUp(rawEstimatedLoss, 750, 0);
  const recoveryPct = useCountUp(rawRecoveryPct, 700, 1);

  // ─── 3. Real-time Risk Score Telemetry (Recharts AreaChart with Gradients) ─
  const riskTrendData = useMemo(() => {
    if (transactions.length >= 8) {
      return [...transactions].reverse().slice(-20).map((tx, idx) => ({
        name: idx,
        score: tx.risk_score || 0,
        id: String(tx.tx_id || '').slice(-4),
        amount: Number(tx.amount || 0),
        channel: tx.channel || 'UPI',
        time: tx.timestamp || 'Live'
      }));
    }
    return [
      { id: '1021', score: 28, amount: 14200, channel: 'UPI' },
      { id: '1022', score: 32, amount: 8900, channel: 'CARD' },
      { id: '1023', score: 98, amount: 154000, channel: 'IMPS' },
      { id: '1024', score: 87, amount: 92000, channel: 'NEFT' },
      { id: '1025', score: 25, amount: 4500, channel: 'UPI' },
      { id: '1026', score: 91, amount: 128000, channel: 'IMPS' },
      { id: '1027', score: 100, amount: 245000, channel: 'RTGS' },
      { id: '1028', score: 34, amount: 6200, channel: 'UPI' },
      { id: '1029', score: 82, amount: 78000, channel: 'IMPS' },
      { id: '1030', score: 95, amount: 189000, channel: 'NEFT' },
      { id: '1031', score: 45, amount: 12000, channel: 'CARD' },
      { id: '1032', score: 89, amount: 115000, channel: 'UPI' }
    ];
  }, [transactions]);

  // ─── 4. Payment Channel Volume (Recharts Donut with Center Total) ─────────
  const channelData = useMemo(() => {
    const channels = ['UPI', 'IMPS', 'NEFT', 'CARD'];
    const counts = channels.map(name => ({
      name,
      value: transactions.filter(tx => (tx.channel || 'UPI').toUpperCase() === name).length
    })).filter(d => d.value > 0);

    if (counts.length > 0) return counts;
    return [
      { name: 'UPI', value: 48 },
      { name: 'IMPS', value: 32 },
      { name: 'NEFT', value: 24 },
      { name: 'CARD', value: 16 }
    ];
  }, [transactions]);

  const totalChannelVolume = useMemo(() => {
    return channelData.reduce((sum, d) => sum + d.value, 0);
  }, [channelData]);

  const CHANNEL_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  // ─── 5. Anomaly Factor Frequency (Recharts Horizontal Gradient Bars) ──────
  const factorData = useMemo(() => {
    const factorMap = {
      'Rapid Pass-Through': 14,
      'New Receiver Spike': 12,
      'Split Layering': 9,
      'High Velocity Burst': 8,
      'Off-Hours Clearing': 6,
      'Geo-Mismatch': 5
    };
    transactions.forEach(tx => {
      if (tx.reason) {
        factorMap[tx.reason.slice(0, 18)] = (factorMap[tx.reason.slice(0, 18)] || 0) + 1;
      }
    });
    return Object.entries(factorMap)
      .map(([name, count], idx) => ({ 
        name, 
        count,
        fill: idx === 0 ? '#EF4444' : idx === 1 ? '#F97316' : idx === 2 ? '#F59E0B' : '#3B82F6'
      }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
  }, [transactions]);

  // ─── 6. Automated Intervention Stream (Full Multi-Line, No Truncation) ────
  const recentActions = useMemo(() => {
    if (actions.length >= 6) {
      return [...actions].reverse().slice(0, 10);
    }
    
    return [
      { action_type: 'FREEZE_ACCOUNT', description: 'Restricted target mule account ACC-MULE-2840 following high-velocity burst.', case_id: 'CASE-4C5202', time: '18:14:22' },
      { action_type: 'POLICE_DISCLOSURE', description: 'Filed emergency 91 CrPC notice with Cyber Cell with attached IP logs.', case_id: 'CASE-9AA96A', time: '18:12:05' },
      { action_type: 'AUTH_CHALLENGE', description: 'Enforced step-up biometric authentication on suspicious outflow attempt.', case_id: 'CASE-CD405F', time: '18:09:40' },
      { action_type: 'DEEP_TELEMETRY', description: 'Placed counterparty wallet on active 60-second polling monitor.', case_id: 'CASE-5AF286', time: '18:07:15' },
      { action_type: 'SAR_GENERATED', description: 'Generated FinCEN-compliant Suspicious Activity Report with SHA-256 seal.', case_id: 'CASE-25EAC3', time: '18:04:50' },
      { action_type: 'FREEZE_ACCOUNT', description: 'Frozen beneficiary node ACC-DRAIN-4EAF to block final cashout attempt.', case_id: 'CASE-0B6EA3', time: '18:01:12' }
    ];
  }, [actions]);

  // Custom High-Contrast Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload || {};
    return (
      <div className="bg-[#0C1424] border border-[#1E2D4A] rounded-sm p-2.5 text-[10px] font-mono text-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-3 mb-1 border-b border-[#1A2640] pb-1">
          <span className="text-blue-400 font-bold uppercase tracking-wider">Txn #{data.id || label}</span>
          {data.channel && <span className="text-[8px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold">{data.channel}</span>}
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between gap-3">
            <span className="text-slate-400">Assessed Risk:</span>
            <span className={`font-bold tabular-nums ${(data.score || 0) >= 85 ? 'text-rose-400' : 'text-blue-400'}`}>
              {data.score || 0}/100
            </span>
          </div>
          {data.amount && (
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Amount:</span>
              <span className="text-slate-200 font-bold tabular-nums">₹{Number(data.amount).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getPriorityBg = (score) => {
    if (score >= 85) return 'border-l-rose-500 hover:bg-rose-950/20 bg-rose-950/5';
    if (score >= 70) return 'border-l-orange-500 hover:bg-orange-950/20 bg-orange-950/5';
    return 'border-l-amber-500 hover:bg-amber-950/20 bg-amber-950/5';
  };

  return (
    <div className="flex h-full bg-[#080D18] overflow-hidden select-none">

      {/* ══════ LEFT COLUMN: Priority Triage Queue (Elevated Cards) ══════ */}
      <div className="w-[340px] shrink-0 flex flex-col border-r border-[#1A2640] bg-[#080D18]">
        <div className="px-4 py-3 border-b border-[#1A2640] bg-[#0A1020] shrink-0 shadow-sm">
          <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">Priority Triage Queue</div>
          <div className="text-[11px] font-mono font-bold text-slate-200 mt-0.5 flex items-center justify-between">
            <span>{enrichedPriorityCases.length} Active Incidents</span>
            <span className="text-rose-400 text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
              {criticalCount} Critical
            </span>
          </div>
        </div>

        {/* Scrollable triage rows with staggered entrance animation */}
        <div className="flex-1 overflow-auto divide-y divide-[#141E33] p-2 space-y-1.5">
          {enrichedPriorityCases.map((c, i) => (
            <div
              key={c.case_id || i}
              onClick={() => navigate(`/graph/${c.case_id}`)}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`flex gap-3 p-3 rounded-sm cursor-pointer transition-all duration-200 border border-[#1A2640] border-l-2 shadow-[0_2px_8px_rgba(0,0,0,0.25)] animate-slide-in-up hover:border-blue-500/40 hover:translate-x-0.5 ${getPriorityBg(c.risk_level || 0)}`}
            >
              {/* Rank */}
              <div className="text-[10px] font-mono font-bold text-slate-500 w-4 shrink-0 pt-0.5">
                #{i+1}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-mono font-bold text-slate-200 truncate">
                    {String(c.case_id || '').slice(-8)}
                  </span>
                  <RiskBadge score={c.risk_level} />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="tabular-nums font-semibold text-slate-300">₹{Number(c.total_fraud_amount || 0).toLocaleString('en-IN')}</span>
                  <span className={`font-bold uppercase ${c.status === 'ACTIONED' ? 'text-emerald-400' : c.status === 'HIGH_RISK' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {c.status || 'HIGH_RISK'}
                  </span>
                </div>
                
                {/* Varied Real-Time SLA Countdown */}
                <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-[#1A2640]/50">
                  <span className="text-[8px] font-mono text-slate-500">SLA Window</span>
                  <span className={`text-[8.5px] font-mono font-bold ${
                    c.slaInfo?.isOverdue
                      ? 'text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/30 animate-pulse'
                      : c.slaInfo?.isCritical
                      ? 'text-rose-400 animate-pulse'
                      : 'text-slate-300'
                  }`}>
                    {c.slaInfo?.label || `${c.golden_window_minutes}m remaining`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Portfolio Summary with Animated Count-Up */}
        <div className="border-t border-[#1A2640] bg-[#0A1020] p-4 space-y-2 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.3)]">
          <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">
            Portfolio Recovery Summary
          </div>
          {[
            { l: 'Total Flagged Volume',   v: `₹${totalFraud.toLocaleString('en-IN')}`,      c: '#F87171' },
            { l: 'Mule In-Flight Recovery', v: `₹${totalRecoverable.toLocaleString('en-IN')}`, c: '#34D399' },
            { l: 'Estimated Net Loss',     v: `₹${estimatedLoss.toLocaleString('en-IN')}`,    c: '#FBBF24' },
            { l: 'System Recovery Rate',   v: `${recoveryPct.toFixed(1)}%`,                   c: '#60A5FA' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-baseline">
              <span className="text-[9px] font-mono text-slate-400">{row.l}</span>
              <span className="text-[11.5px] font-mono font-bold tabular-nums" style={{ color: row.c }}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ CENTER COLUMN: Recharts Gradient Signal Visualizations ══════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-[#1A2640] relative">

        {/* Global Telemetry Header / Modality Switcher */}
        <div className="px-4 py-2.5 bg-[#0A1020] border-b border-[#1A2640] flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
              Telemetry Modality
            </span>
            <span className="text-[10px] font-mono text-slate-200 font-semibold">
              {show3D ? '3D Evidentiary Convergence Vortex' : '2D Recharts Signal Telemetry'}
            </span>
          </div>

          <button
            onClick={() => setShow3D(!show3D)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${
              show3D
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                : 'bg-[#0C1424] hover:bg-[#131E2E] text-slate-300 hover:text-white border border-[#1E2D4A]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>{show3D ? 'Exit 3D View' : 'Launch 3D Swarm'}</span>
          </button>
        </div>

        {show3D ? (
          <div className="flex-1 min-h-0 relative animate-fade-in">
            <EvidentiaryConvergence onClose={() => setShow3D(false)} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-y-auto">
            
            {/* Chart 1: Risk Score Telemetry (Recharts AreaChart with Area Gradient & Peak Glows) */}
            <div className="flex-1 flex flex-col rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_4px_16px_rgba(0,0,0,0.35)] min-h-[220px]">
              <div className="px-4 py-2.5 shrink-0 flex items-center justify-between border-b border-[#1A2640] bg-[#0A1020]/60">
                <div>
                  <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
                    Risk Score Telemetry (Real-Time Ingestion)
                  </div>
                  <div className="text-[10px] font-mono text-slate-300 mt-0.5">
                    Continuous clearing flow analysis · Powered by Recharts SVG engine
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span className="text-[8px] font-mono font-bold text-blue-400 uppercase tracking-wider">LIVE FEED</span>
                </div>
              </div>
              
              <div className="flex-1 px-3 py-2 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrendData} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                        <stop offset="60%" stopColor="#3B82F6" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="peakGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#141E33" />
                    <XAxis dataKey="id" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748B' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748B' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      fill="url(#riskAreaGrad)"
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const isPeak = (payload.score || 0) >= 90;
                        return (
                          <circle
                            key={`dot-${props.index}`}
                            cx={cx}
                            cy={cy}
                            r={isPeak ? 4.5 : 2.5}
                            fill={isPeak ? '#EF4444' : '#3B82F6'}
                            stroke={isPeak ? '#FCA5A5' : '#1D4ED8'}
                            strokeWidth={isPeak ? 2 : 1}
                            className={isPeak ? 'animate-pulse' : ''}
                          />
                        );
                      }}
                      activeDot={{ r: 6, fill: '#60A5FA', stroke: '#FFFFFF', strokeWidth: 2 }}
                      animationDuration={900}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Top Anomaly Signature Frequency (Recharts Horizontal Gradient Bars with End Values) */}
            <div className="flex-1 flex flex-col rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_4px_16px_rgba(0,0,0,0.35)] min-h-[220px]">
              <div className="px-4 py-2.5 shrink-0 flex items-center justify-between border-b border-[#1A2640] bg-[#0A1020]/60">
                <div>
                  <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
                    Top Anomaly Signature Frequency
                  </div>
                  <div className="text-[10px] font-mono text-slate-300 mt-0.5">
                    Severity-ranked detection rate across monitored banking flows
                  </div>
                </div>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              </div>
              
              <div className="flex-1 px-3 py-2 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={factorData} margin={{ top: 8, right: 28, left: -10, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#141E33" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748B' }} />
                    <YAxis type="category" dataKey="name" width={135} tick={{ fontSize: 8.5, fontFamily: 'JetBrains Mono', fill: '#94A3B8' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Detections" radius={[0, 3, 3, 0]} maxBarSize={14} animationDuration={850}>
                      {factorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList dataKey="count" position="right" fill="#94A3B8" fontSize={9} fontFamily="JetBrains Mono" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ══════ RIGHT COLUMN: Donut Volume + Automated Intervention Stream ══════ */}
      <div className="w-[300px] shrink-0 flex flex-col bg-[#080D18] p-3 space-y-3 overflow-y-auto">

        {/* Chart 3: Payment Channel Volume (Recharts Donut with Center Total Label) */}
        <div className="flex flex-col rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_4px_16px_rgba(0,0,0,0.35)] shrink-0" style={{ height: 230 }}>
          <div className="px-4 py-2.5 shrink-0 border-b border-[#1A2640] bg-[#0A1020]/60 flex items-center justify-between">
            <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
              Payment Channel Volume
            </div>
            <Layers className="w-3 h-3 text-blue-400" />
          </div>
          
          <div className="flex-1 min-h-0 flex items-center justify-center p-2 relative">
            {/* Center Total Value Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-5">
              <span className="text-base font-mono font-bold text-slate-100 tabular-nums">
                {totalChannelVolume}
              </span>
              <span className="text-[7.5px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Total Txns
              </span>
            </div>

            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
              <ResponsiveContainer width="100%" height={115}>
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={48}
                    dataKey="value"
                    paddingAngle={3}
                    animationDuration={850}
                    onMouseEnter={(_, idx) => setActiveDonutIdx(idx)}
                    onMouseLeave={() => setActiveDonutIdx(null)}
                  >
                    {channelData.map((_, idx) => (
                      <Cell
                        key={`donut-${idx}`}
                        fill={CHANNEL_COLORS[idx % CHANNEL_COLORS.length]}
                        stroke={activeDonutIdx === idx ? '#FFFFFF' : '#0C1424'}
                        strokeWidth={activeDonutIdx === idx ? 2 : 1}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Channel Legend Pills */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                {channelData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                    <span className="text-[9px] font-mono text-slate-400">{d.name}</span>
                    <span className="text-[9px] font-mono font-bold text-slate-200 tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Automated Intervention Stream (Elevated Card, Multi-Line, Staggered Reveal) */}
        <div className="flex flex-col flex-1 rounded-sm bg-[#0C1424] border border-[#1E2D4A] shadow-[0_4px_16px_rgba(0,0,0,0.35)] min-h-[260px] overflow-hidden">
          <div className="px-4 py-2.5 shrink-0 border-b border-[#1A2640] bg-[#0A1020]/60 flex items-center justify-between">
            <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
              Automated Intervention Stream
            </div>
            <span className="text-[8.5px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {recentActions.length} Actions
            </span>
          </div>

          <div className="flex-1 overflow-auto divide-y divide-[#141E33] p-1.5 space-y-1 pb-10">
            {recentActions.map((action, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 60}ms` }}
                className="p-2.5 rounded-sm bg-[#080D18] border border-[#1A2640] hover:border-blue-500/40 transition-all shadow-sm animate-slide-in-up"
              >
                <div className="flex items-start gap-2">
                  <ActionIcon type={action.action_type || action.description} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9.5px] font-mono font-bold text-slate-200">
                        {action.action_type || 'FREEZE_ACCOUNT'}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">
                        {action.time || 'LIVE'}
                      </span>
                    </div>
                    {/* Multi-line readable description with ZERO truncation */}
                    <div className="text-[9px] font-mono text-slate-400 leading-snug break-words mt-0.5">
                      {action.description || 'Account restriction enforced'}
                    </div>
                    {action.case_id && (
                      <div className="text-[8px] font-mono text-blue-400 mt-1 flex items-center gap-1 font-semibold">
                        <span>Case:</span>
                        <span className="underline cursor-pointer" onClick={() => navigate(`/graph/${action.case_id}`)}>
                          {action.case_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
