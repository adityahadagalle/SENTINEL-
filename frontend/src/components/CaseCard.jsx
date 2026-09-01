import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import GoldenTimer from './GoldenTimer';
import ActionButton from './ActionButton';
import FactorBreakdown from './FactorBreakdown';
import { maskAccount } from '../utils/maskAccount';
import { Shield, ChevronDown, ChevronUp, AlertCircle, ArrowRight } from 'lucide-react';

const CaseCard = ({ caseData, onAnalyze, transactions = [], role }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isViewer = role !== 'admin';
  
  if (!caseData) return null;

  const totalFraud = caseData.total_fraud_amount || 0;
  const recoverable = caseData.recoverable_amount || 0;
  const recoveryPercent = totalFraud > 0 ? ((recoverable / totalFraud) * 100).toFixed(1) : "0.0";

  // Get factors from the first transaction associated with this case
  const relatedTx = transactions.find(tx => tx.case_id === caseData.case_id);
  const factors = relatedTx?.risk_factors || [];

  const handleAction = async (e, actionEndpoint) => {
    e.stopPropagation();
    if (isViewer) return;
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      await fetch(`${API_BASE}/action/${actionEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseData.case_id,
          account_id: 'GLOBAL',
          reason: `Action ${actionEndpoint} executed from Case Card`
        })
      });
    } catch (error) {
      console.error('Network error during action:', error);
    }
  };

  const getStatusBadgeStyle = (status) => {
    if (status === 'HIGH_RISK')   return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (status === 'ACTIONED')    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (status === 'MONITORING')  return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (status === 'CLOSED')      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    if (status === 'CLOSED_FP')   return 'bg-slate-600/10 text-slate-500 border-slate-600/30';
    return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
  };

  return (
    <div 
      onClick={() => onAnalyze && onAnalyze(caseData, relatedTx)}
      className={`bg-[#111927] border rounded-2xl p-6 shadow-2xl shadow-black/40 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
        isExpanded 
          ? 'ring-1 ring-blue-500/40 border-blue-500/30' 
          : 'border-slate-800 hover:border-slate-700 hover:shadow-black/60 hover:bg-[#131f30]'
      }`}
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Case Identifier</span>
            <h3 className="text-sm font-mono font-bold text-slate-100 tracking-tight">{caseData.case_id}</h3>
          </div>
          <RiskBadge score={caseData.risk_level} />
        </div>

        {/* Chain & Recovery Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 mb-4">
          <div>
            <span className="text-[9px] text-slate-500 block font-medium uppercase tracking-wider mb-1">Chain Depth</span>
            <span className="font-mono text-xs font-semibold text-slate-200">{caseData.chain?.length || 0}
              <span className="text-slate-500 font-normal ml-1">accounts</span>
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block font-medium uppercase tracking-wider mb-1">Recovery</span>
            <span className={`font-mono text-xs font-semibold ${parseFloat(recoveryPercent) > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {recoveryPercent}%
            </span>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="space-y-2.5 mb-5 px-1">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-medium">Total Fraud Value</span>
            <span className="font-mono text-xs font-bold text-slate-100">₹{caseData.total_fraud_amount.toLocaleString()}</span>
          </div>
          <div className="w-full h-px bg-slate-800/80" />
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-medium">Recoverable Value</span>
            <span className="font-mono text-xs font-bold text-emerald-400">₹{caseData.recoverable_amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Status & Golden Timer */}
        <div className="pt-3.5 border-t border-slate-800/80 flex justify-between items-center mb-4">
          <GoldenTimer minutes={caseData.golden_window_minutes} />
          <span className={`text-[9px] font-mono font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusBadgeStyle(caseData.status)}`}>
            {caseData.status}
          </span>
        </div>

        {/* Quick Action Buttons — 3-tier hierarchy */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Primary — Critical Action */}
          <button 
            onClick={(e) => handleAction(e, 'freeze')} 
            disabled={isViewer} 
            className="py-2 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold transition-all duration-150
              shadow-lg shadow-rose-900/20 border border-rose-600/60 hover:border-rose-500/80
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Freeze
          </button>
          {/* Secondary — Outline */}
          <button 
            onClick={(e) => handleAction(e, 'alert')} 
            disabled={isViewer} 
            className="py-2 px-2 border border-slate-600 text-slate-300 bg-transparent hover:bg-slate-800 hover:text-white
              rounded-lg text-[10px] font-semibold transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Police
          </button>
          {/* Secondary — Outline */}
          <button 
            onClick={(e) => handleAction(e, 'flag')} 
            disabled={isViewer} 
            className="py-2 px-2 border border-slate-600 text-slate-300 bg-transparent hover:bg-slate-800 hover:text-white
              rounded-lg text-[10px] font-semibold transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Escalate
          </button>
        </div>
      </div>

      {/* Expandable Chain Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
          <div>
            <h4 className="text-[9px] font-semibold uppercase text-slate-500 mb-2.5 tracking-widest">Transaction Chain</h4>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              {caseData.chain.map((account, idx) => (
                <React.Fragment key={account}>
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20 text-[10px]">
                    {isViewer ? maskAccount(account) : account}
                  </span>
                  {idx < caseData.chain.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
          <FactorBreakdown factors={factors} />
        </div>
      )}

      <button 
        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-blue-400 
          transition-colors pt-2.5 border-t border-slate-800/60 mt-2"
      >
        <span>{isExpanded ? 'Collapse Details' : 'View Chain Details'}</span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

export default CaseCard;
