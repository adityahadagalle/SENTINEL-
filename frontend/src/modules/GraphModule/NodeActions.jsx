import React from 'react';
import { maskAccount } from '../../utils/maskAccount';
import { Shield, AlertTriangle, X, Lock, CheckCircle2 } from 'lucide-react';

/**
 * NodeActions Component
 * 
 * Contextual actions popup overlay when an account node is clicked in the graph.
 */
const NodeActions = ({ 
  node, 
  onClose, 
  executeAction, 
  processingNodes, 
  role 
}) => {
  if (!node) return null;

  const isViewer = role !== 'admin';
  const displayId = isViewer ? maskAccount(node.id) : node.id;
  const isFrozen = node.status === 'frozen';
  const isWithdrawn = node.status === 'withdrawn';
  const isProcessing = !!processingNodes[node.id] || isViewer;

  const statusColor = isFrozen ? '#64748B' : isWithdrawn ? '#EF4444' : '#10B981';

  return (
    <div className="absolute top-16 left-4 z-30 p-4 rounded-lg bg-[#0D1829]/95 border border-slate-700/80 shadow-2xl backdrop-blur-md w-72 space-y-3 font-sans select-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
            Selected Entity Node
          </span>
          <div className="text-xs font-mono font-bold text-slate-100 tracking-tight mt-0.5">
            {displayId}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
            <span className="text-[10px] font-mono uppercase text-slate-400">
              Status: {node.status || 'Active'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => executeAction('freeze', { accountId: node.id })}
          disabled={isProcessing || isFrozen || isWithdrawn}
          className="w-full py-2 px-3 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
        >
          <Lock className="w-3 h-3" />
          <span>{isProcessing ? 'FREEZING...' : isFrozen ? 'ACCOUNT FROZEN' : 'FREEZE ACCOUNT'}</span>
        </button>

        <button
          onClick={() => executeAction('flag', { accountId: node.id })}
          disabled={isProcessing || isFrozen || isWithdrawn}
          className="w-full py-1.5 px-3 rounded bg-transparent hover:bg-amber-500/10 disabled:opacity-40 text-amber-400 border border-amber-500/40 text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>FLAG FOR INVESTIGATION</span>
        </button>
      </div>

      {isProcessing && !isFrozen && !isWithdrawn && (
        <div className="text-[10px] text-blue-400 font-mono text-center">
          Sending instruction to clearing network...
        </div>
      )}

      {(isFrozen || isWithdrawn) && !isProcessing && (
        <div className="text-[10px] text-slate-400 font-mono p-2 bg-[#111927] rounded border border-slate-800 text-center">
          Account restricted under emergency protocol.
        </div>
      )}
    </div>
  );
};

export default NodeActions;
