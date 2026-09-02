import React from 'react';
import { AlertTriangle, Clock, Network, ArrowRight, Shield } from 'lucide-react';
import RiskBadge from './RiskBadge';

/**
 * CaseBanner — Sub-header case metadata strip
 * Displays case context in a single dense forensic line on the Graph investigation page
 */
const CaseBanner = ({ caseData }) => {
  if (!caseData) return null;

  const totalFraud = Number(caseData.total_fraud_amount || 0);
  const fraudStr = totalFraud >= 100000
    ? `₹${(totalFraud / 100000).toFixed(2)}L`
    : `₹${totalFraud.toLocaleString('en-IN')}`;

  const chainDepth = (caseData.chain || []).length || 4;
  const nodeCount = (caseData.nodes || []).length || 6;
  const edgeCount = (caseData.edges || []).length || 5;
  const primaryAccount = caseData.primary_tx_id || caseData.chain?.[0] || 'ACC-VICTIM-8301';

  return (
    <div className="w-full px-4 py-2 bg-[#040810] border-b border-[#1A2640] flex items-center gap-3.5 overflow-x-auto shrink-0 select-none">
      {/* Case ID */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-600">Case</span>
        <span className="text-[11px] font-mono font-bold text-slate-200">{caseData.case_id}</span>
      </div>

      <Divider />

      {/* Risk Badge */}
      <div className="shrink-0">
        <RiskBadge score={caseData.risk_level || 91} />
      </div>

      <Divider />

      {/* Primary Flagged Account */}
      <div className="flex items-center gap-1.5 shrink-0">
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <span className="text-[10px] font-mono text-slate-300">{primaryAccount}</span>
      </div>

      <Divider />

      {/* Fraud Volume */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-600">Suspicious Flow</span>
        <span className="text-[12px] font-mono font-bold text-amber-400">{fraudStr}</span>
      </div>

      <Divider />

      {/* Topology Metrics */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1">
          <Network className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-mono text-slate-300">{chainDepth}-hop</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">{nodeCount} nodes</span>
        <span className="text-[10px] font-mono text-slate-500">{edgeCount} txns</span>
      </div>

      <Divider />

      {/* SLA Golden Window */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <Clock className="w-3 h-3 text-slate-500" />
        <span className="text-[9px] font-mono font-bold text-slate-300 uppercase">{caseData.status || 'HIGH_RISK'}</span>
        <span className="text-[8px] font-mono text-slate-600">•</span>
        <span className="text-[9px] font-mono text-rose-400 font-bold">
          GW: {caseData.golden_window_minutes || 20}m SLA
        </span>
      </div>
    </div>
  );
};

const Divider = () => <div className="w-px h-3.5 bg-[#1A2640] shrink-0" />;

export default CaseBanner;
