import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import RiskBadge from '../components/RiskBadge';
import { getRole } from '../roleStore';
import { Network, AlertTriangle, TrendingUp, Activity, ShieldCheck } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';

const Dashboard = () => {
  const { cases, actions, transactions } = useWebSocket();
  const navigate = useNavigate();
  const role = getRole();

  const calculateUrgency = (c) => {
    const risk = c.risk_level || 0;
    const window = Math.max(c.golden_window_minutes || 1, 1);
    return risk * (1 + 1 / window);
  };

  const sortedCases = useMemo(() => [...cases].sort((a, b) => calculateUrgency(b) - calculateUrgency(a)), [cases]);
  const topCases = sortedCases.slice(0, 8);
  const totalFraud = useMemo(() => cases.reduce((sum, c) => sum + (c.total_fraud_amount || 0), 0), [cases]);
  const totalRecoverable = useMemo(() => cases.reduce((sum, c) => sum + (c.recoverable_amount || 0), 0), [cases]);
  const estimatedLoss = Math.max(0, totalFraud - totalRecoverable);
  const recoveryPct = totalFraud > 0 ? ((totalRecoverable / totalFraud) * 100).toFixed(1) : '0.0';
  const criticalCount = useMemo(() => cases.filter(c => (c.risk_level||0) >= 80).length, [cases]);

  const riskTrendData = useMemo(() => {
    return [...transactions].reverse().slice(-20).map((tx, idx) => ({
      name: idx, score: tx.risk_score || 0, id: String(tx.tx_id || '').slice(-4)
    }));
  }, [transactions]);

  const channelData = useMemo(() => {
    const channels = ['UPI', 'IMPS', 'NEFT', 'CARD'];
    return channels.map(name => ({
      name, value: transactions.filter(tx => (tx.channel || 'UPI').toUpperCase() === name).length
    })).filter(d => d.value > 0);
  }, [transactions]);

  const CHANNEL_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const factorData = useMemo(() => {
    const factorMap = {};
    transactions.forEach(tx => {
      tx.risk_factors?.forEach(f => {
        const key = f.name || f;
        factorMap[key] = (factorMap[key] || 0) + 1;
      });
    });
    return Object.entries(factorMap)
      .map(([name, count]) => ({ name: String(name).replace(/_/g, ' ').slice(0, 20), count }))
      .sort((a, b) => b.count - a.count).slice(0, 6);
  }, [transactions]);

  const recentActions = useMemo(() => [...actions].reverse().slice(0, 8), [actions]);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#0F1926] border border-[#1A2640] rounded px-3 py-2 text-[10px] font-mono text-slate-300 shadow-xl">
        {payload.map((p, i) => <div key={i}>{p.name}: <span className="text-blue-400">{p.value}</span></div>)}
      </div>
    );
  };

  const getPriorityBg = (score) => {
    if (score >= 80) return 'border-l-rose-500';
    if (score >= 60) return 'border-l-orange-500';
    return 'border-l-amber-500';
  };

  return (
    <div className="flex h-full bg-[#080D18] overflow-hidden">

      {/* ══════ LEFT COLUMN: Priority Cases ══════ */}
      <div className="w-[340px] shrink-0 flex flex-col border-r border-[#1A2640]">
        <div className="px-4 py-3 border-b border-[#1A2640] bg-[#040810] shrink-0">
          <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700">Priority Triage</div>
          <div className="text-[11px] font-semibold text-slate-200 mt-0.5">
            {cases.length} cases · {criticalCount} critical
          </div>
        </div>

        <div className="flex-1 overflow-auto divide-y divide-[#131E2E]">
          {topCases.map((c, i) => (
            <div
              key={c.case_id}
              onClick={() => navigate(`/graph/${c.case_id}`)}
              className={`flex gap-3 px-4 py-3 hover:bg-[#0F1926] cursor-pointer transition-colors border-l-2 ${getPriorityBg(c.risk_level || 0)}`}
            >
              {/* Rank */}
              <div className="text-[10px] font-mono font-bold text-slate-700 w-4 shrink-0 pt-0.5">
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
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-600">
                  <span>₹{Number(c.total_fraud_amount||0).toLocaleString('en-IN')}</span>
                  <span className={`font-bold ${c.status === 'ACTIONED' ? 'text-emerald-600' : c.status === 'HIGH_RISK' ? 'text-rose-600' : 'text-slate-600'}`}>
                    {c.status}
                  </span>
                </div>
                {c.golden_window_minutes && (
                  <div className="mt-1">
                    <div className="s-progress">
                      <div className="s-progress-fill" style={{
                        width: `${Math.min(100, (c.golden_window_minutes / 60) * 100)}%`,
                        background: c.golden_window_minutes < 15 ? '#EF4444' : c.golden_window_minutes < 30 ? '#F59E0B' : '#3B82F6'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {topCases.length === 0 && (
            <div className="text-center text-slate-700 text-[10px] font-mono py-12">No cases loaded</div>
          )}
        </div>

        {/* Financial summary */}
        <div className="border-t border-[#1A2640] bg-[#040810] px-4 py-3 space-y-1.5 shrink-0">
          <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700 mb-2">Portfolio Summary</div>
          {[
            { l: 'Total Exposure',  v: `₹${totalFraud.toLocaleString('en-IN')}`,         c: '#F87171' },
            { l: 'Recoverable',    v: `₹${totalRecoverable.toLocaleString('en-IN')}`,    c: '#34D399' },
            { l: 'Estimated Loss', v: `₹${estimatedLoss.toLocaleString('en-IN')}`,       c: '#FBBF24' },
            { l: 'Recovery Rate',  v: `${recoveryPct}%`,                                  c: '#60A5FA' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-baseline">
              <span className="text-[9px] font-mono text-slate-700">{row.l}</span>
              <span className="text-[11px] font-mono font-bold" style={{ color: row.c }}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════ CENTER COLUMN: Charts ══════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-[#1A2640]">

        {/* Risk Trend */}
        <div className="flex-1 flex flex-col border-b border-[#1A2640] min-h-0">
          <div className="px-4 pt-3 pb-2 shrink-0 flex items-center justify-between border-b border-[#1A2640]">
            <div>
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700">Risk Score Trend</div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">Last 20 transactions · real-time</div>
            </div>
            <Activity className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <div className="flex-1 px-2 py-3 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskTrendData} margin={{ top: 4, right: 16, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2640" />
                <XAxis dataKey="id" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#3D5170' }} />
                <YAxis domain={[0,100]} tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#3D5170' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="score" name="Risk Score"
                  stroke="#3B82F6" strokeWidth={1.5} dot={{ r: 2, fill: '#3B82F6', strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: '#60A5FA' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Factor frequency */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 pt-3 pb-2 shrink-0 flex items-center justify-between border-b border-[#1A2640]">
            <div>
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700">Anomaly Factor Frequency</div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">Top risk signal occurrence rates</div>
            </div>
            <AlertTriangle className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <div className="flex-1 px-2 py-3 min-h-0">
            {factorData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={factorData} margin={{ top: 4, right: 16, left: -24, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2640" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#3D5170' }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 8, fontFamily: 'JetBrains Mono', fill: '#3D5170' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Count" fill="#3B82F6" radius={[0, 2, 2, 0]} maxBarSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[10px] font-mono text-slate-700">
                Awaiting transaction data...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════ RIGHT COLUMN: Channel + Actions ══════ */}
      <div className="w-[260px] shrink-0 flex flex-col">

        {/* Channel breakdown */}
        <div className="flex flex-col border-b border-[#1A2640]" style={{ height: 220 }}>
          <div className="px-4 pt-3 pb-2 shrink-0 border-b border-[#1A2640]">
            <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700">Channel Volume</div>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {channelData.length > 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-3 py-2">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={channelData} cx="50%" cy="50%"
                      innerRadius={28} outerRadius={46}
                      dataKey="value" paddingAngle={2}
                    >
                      {channelData.map((_, idx) => (
                        <Cell key={idx} fill={CHANNEL_COLORS[idx % CHANNEL_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                  {channelData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                      <span className="text-[9px] font-mono text-slate-500">{d.name}</span>
                      <span className="text-[9px] font-mono font-bold text-slate-400">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[10px] font-mono text-slate-700">No data</div>
            )}
          </div>
        </div>

        {/* Agent action log */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 pt-3 pb-2 shrink-0 border-b border-[#1A2640] flex items-center justify-between">
            <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700">Agent Action Log</div>
            <span className="text-[9px] font-mono text-slate-700">{actions.length}</span>
          </div>
          <div className="flex-1 overflow-auto divide-y divide-[#131E2E]">
            {recentActions.map((action, i) => (
              <div key={i} className="px-4 py-2.5 hover:bg-[#0F1926] transition-colors">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-600/50 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-mono text-slate-400 leading-relaxed truncate">
                      {action.action_type || action.description || 'Agent action'}
                    </div>
                    {action.case_id && (
                      <div className="text-[8px] font-mono text-slate-700 mt-0.5">
                        Case: {String(action.case_id).slice(-8)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {recentActions.length === 0 && (
              <div className="text-center text-slate-700 text-[9px] font-mono py-8">
                Waiting for agent actions...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
