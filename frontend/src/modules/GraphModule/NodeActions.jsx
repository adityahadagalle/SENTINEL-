import React from 'react';
import { maskAccount } from '../../utils/maskAccount';
import { Shield, AlertTriangle, X, Lock, CheckCircle2, Activity } from 'lucide-react';

/**
 * NodeActions Component
 * 
 * Contextual actions popup overlay when an account node is clicked in the graph.
 * Styled with SENTINEL dark forensic tokens.
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
    <div className="absolute top-16 left-4 z-30 p-3.5 rounded-sm bg-[#0C1220]/95 border border-[#1A2640] shadow-2xl backdrop-blur-md w-72 space-y-3 font-sans select-none animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-[0.14em] block">
            Selected Entity Node
          </span>
          <div className="text-[11px] font-mono font-bold text-slate-100 mt-0.5">
            {displayId}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
            <span className="text-[9px] font-mono uppercase text-slate-400">
              Status: {node.status || 'Active In-Flow'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-sm text-slate-400 hover:text-slate-100 hover:bg-[#131E2E] transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-1.5 pt-1">
        <button
          onClick={() => executeAction('freeze', { accountId: node.id })}
          disabled={isProcessing || isFrozen || isWithdrawn}
          className="w-full py-2 px-3 rounded-sm bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-rose-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <Lock className="w-3 h-3 text-rose-400" />
          <span>{isProcessing ? 'PROCESSING...' : isFrozen ? 'ACCOUNT FROZEN' : 'FREEZE ACCOUNT'}</span>
        </button>

        <button
          onClick={() => executeAction('flag', { accountId: node.id })}
          disabled={isProcessing || isFrozen || isWithdrawn}
          className="w-full py-1.5 px-3 rounded-sm bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/30 disabled:opacity-40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>FLAG NODE</span>
        </button>
      </div>

      {isProcessing && !isFrozen && !isWithdrawn && (
        <div className="text-[9px] text-blue-400 font-mono text-center animate-pulse">
          Transmitting instruction to clearing network...
        </div>
      )}

      {(isFrozen || isWithdrawn) && !isProcessing && (
        <div className="text-[9px] text-slate-400 font-mono p-2 bg-[#080D18] rounded-sm border border-[#1A2640] text-center">
          Account restricted under emergency fraud protocol.
        </div>
      )}
    </div>
  );
};

export default NodeActions;
