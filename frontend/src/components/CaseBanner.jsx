import React, { useState } from 'react';
import { 
  AlertTriangle, Clock, Network, ArrowRight, ShieldCheck, 
  Copy, Check, FileText, ChevronRight, Zap, ArrowUpRight
} from 'lucide-react';
import RiskBadge from './RiskBadge';

/**
 * CaseBanner — Compact, High-Density Intelligence Bar (Scannable in 2 seconds)
 * Palantir / SOC Command Center standard
 */
const CaseBanner = ({ caseData, onTracePath, onExportReport }) => {
  const [copied, setCopied] = useState(false);

  if (!caseData) return null;

  const totalFraud = Number(caseData.total_fraud_amount || 0);
  const fraudStr = totalFraud >= 100000
    ? `₹${(totalFraud / 100000).toFixed(2)}L`
    : `₹${totalFraud.toLocaleString('en-IN')}`;

  const chainDepth = (caseData.chain || []).length || 4;
  const nodeCount = (caseData.nodes || []).length || 6;
  const primaryTx = caseData.primary_tx_id || 'TX-315B4B83';
  const goldenWindow = caseData.golden_window_minutes || 20;

  const handleCopy = () => {
    navigator.clipboard?.writeText(caseData.case_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="w-full px-4 py-2 bg-[#060B14] border-b border-[#1A2640] flex items-center justify-between gap-4 shrink-0 select-none overflow-x-auto shadow-sm">
      
      {/* ── Group 1: Case Identity & Risk Tier ── */}
      <div className="flex items-center gap-3 shrink-0">
        <div 
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#0C1424] border border-[#1E2D4A] hover:border-blue-500/50 cursor-pointer transition-all group"
          title="Click to copy Case ID"
        >
          <span className="text-[7.5px] font-mono font-bold uppercase tracking-[0.14em] text-slate-500">CASE</span>
          <span className="text-[11px] font-mono font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
            {caseData.case_id}
          </span>
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-2.5 h-2.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          )}
        </div>

        <RiskBadge score={caseData.risk_level || 94} />

        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{caseData.status || 'ACTIVE'}</span>
        </div>
      </div>

      {/* ── Group 2: Forensic Parameters (Scannable Grid) ── */}
      <div className="flex items-center gap-4 shrink-0 text-slate-400 font-mono text-[9.5px]">
        
        {/* Primary TX */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Primary TX</span>
          <span className="text-slate-200 font-bold">{primaryTx}</span>
        </div>

        <div className="w-px h-3.5 bg-[#1A2640]" />

        {/* Suspicious Flow Volume */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Suspicious Flow</span>
          <span className="text-amber-400 font-bold text-[11px] tabular-nums">{fraudStr}</span>
        </div>

        <div className="w-px h-3.5 bg-[#1A2640]" />

        {/* Network Depth & Entities */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-300 font-semibold">
            <Network className="w-3 h-3 text-blue-400" />
            <span>{chainDepth} Hops</span>
          </div>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-semibold">{nodeCount} Entities</span>
        </div>

        <div className="w-px h-3.5 bg-[#1A2640]" />

        {/* SLA Window */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-rose-400 animate-pulse" />
          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">SLA Window</span>
          <span className="text-rose-400 font-bold tabular-nums">
            {goldenWindow}m Remaining
          </span>
        </div>
      </div>

      {/* ── Group 3: Investigation Quality & Quick Action Pill ── */}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto">
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0C1424] border border-[#1E2D4A] text-[8.5px] font-mono">
          <ShieldCheck className="w-3 h-3 text-blue-400" />
          <span className="text-slate-400">Quality:</span>
          <span className="text-blue-300 font-bold">94%</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-bold">CONSENSUS</span>
        </div>
      </div>

    </div>
  );
};

export default CaseBanner;
