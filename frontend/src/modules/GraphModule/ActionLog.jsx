import React from 'react';
import { getRole } from '../../roleStore';
import { maskAccount } from '../../utils/maskAccount';

/**
 * ActionLog Component
 * Displays rich audit trail with reasoning and graph cross-linking.
 */
const ActionLog = ({ logs, actionLog, onLogClick }) => {
  const role = getRole();
  const isViewer = role !== 'admin';
  const rawLogs = logs || actionLog || [];
  const safeLogs = Array.isArray(rawLogs) ? rawLogs : [];

  const getActionColor = (type = '') => {
    const t = String(type).toUpperCase();
    if (t.includes('FREEZE')) return '#F87171';
    if (t.includes('FLAG'))   return '#FBBF24';
    if (t.includes('ALERT'))  return '#A78BFA';
    if (t.includes('MONITOR')) return '#60A5FA';
    return '#34D399';
  };

  const formatTarget = (target) => {
    if (!target || target === 'GLOBAL' || target === 'SUSPECTS') return target;
    return isViewer ? maskAccount(target) : target;
  };

  return (
    <div className="flex flex-col gap-1.5 overflow-y-auto max-h-64 p-1">
      <h4 className="text-[8px] text-slate-500 uppercase tracking-[0.14em] font-mono font-bold">
        Investigation Audit Ledger ({safeLogs.length})
      </h4>
      
      {safeLogs.length === 0 && (
        <div className="text-[10px] text-slate-600 italic font-mono py-2">
          Awaiting legal enforcement events...
        </div>
      )}

      {safeLogs.map((log, idx) => {
        const id = log.action_id || `log-${idx}`;
        const actionType = log.action_type || 'FREEZE_ACCOUNT';
        const target = log.target || log.target_account || 'GLOBAL';
        const status = log.status || 'ACK';

        return (
          <div 
            key={id} 
            onClick={() => target !== 'GLOBAL' && onLogClick?.(target)}
            className={`text-[10px] font-mono p-2 rounded bg-[#080D18] border transition-all ${
              status === 'NACK' ? 'border-rose-500/30' : 'border-[#1A2640] hover:border-blue-500/40'
            } ${target !== 'GLOBAL' ? 'cursor-pointer hover:bg-[#131E2E]' : 'cursor-default'}`}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-600">[{log.timestamp || 'LIVE'}]</span>
                <span className="font-bold" style={{ color: getActionColor(actionType) }}>
                  {actionType}
                </span>
                <span className="text-slate-300 font-medium">{formatTarget(target)}</span>
              </div>
              <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded ${
                status === 'ACK' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
              }`}>
                {status}
              </span>
            </div>
            
            <div className="text-[9px] text-slate-500 flex justify-between">
              <span className="italic truncate max-w-[75%]">
                {log.reason || log.description || 'Intervention executed by Sentinel Orchestrator'}
              </span>
              <span>{log.latency ? `${log.latency}ms` : '12ms'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActionLog;
