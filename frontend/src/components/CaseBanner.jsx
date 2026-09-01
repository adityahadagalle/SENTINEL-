import React from 'react';
import { AlertTriangle, Clock, Network, ArrowRight } from 'lucide-react';

/**
 * CaseBanner — Sub-header case metadata strip
 * Displays case context in a single dense line on the Graph investigation page
 */
const CaseBanner = ({ caseData }) => {
  if (!caseData) return null;

  const riskLevel = Number(caseData.risk_level || 0);
  const riskLabel = riskLevel >= 80 ? 'CRITICAL' : riskLevel >= 60 ? 'HIGH' : riskLevel >= 40 ? 'MEDIUM' : 'LOW';
  const riskBadgeClass = riskLevel >= 80 ? 'sentinel-badge-critical' : riskLevel >= 60 ? 'sentinel-badge-high' : riskLevel >= 40 ? 'sentinel-badge-medium' : 'sentinel-badge-low';

  const totalFraud = Number(caseData.total_fraud_amount || 0);
  const fraudStr = totalFraud >= 100000
    ? `₹${(totalFraud / 100000).toFixed(1)}L`
    : `₹${totalFraud.toLocaleString('en-IN')}`;

  const chainDepth = (caseData.chain || []).length;
  const nodeCount = (caseData.nodes || []).length;
  const edgeCount = (caseData.edges || []).length;
  const primaryAccount = caseData.primary_tx_id || caseData.chain?.[0] || '—';

  return (
    <div className="w-full px-5 py-2 bg-[#0D1424] border-b border-slate-800/80 flex items-center gap-4 overflow-x-auto shrink-0 select-none">
      {/* Case ID */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="sentinel-section-label text-[8px]">Case</span>
        <span className="sentinel-mono text-[11px] font-bold text-slate-200">{caseData.case_id}</span>
      </div>

      <Divider />

      {/* Risk Badge */}
      <span className={`sentinel-badge ${riskBadgeClass} shrink-0`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{
          background: riskLevel >= 80 ? '#f87171' : riskLevel >= 60 ? '#fb923c' : riskLevel >= 40 ? '#fbbf24' : '#34d399'
        }} />
        {riskLabel} {riskLevel}
      </span>

      <Divider />

      {/* Primary Account */}
      <div className="flex items-center gap-1.5 shrink-0">
        <AlertTriangle className="w-3 h-3 text-slate-600" />
        <span className="sentinel-mono text-[10px] text-slate-400">{primaryAccount}</span>
      </div>

      <Divider />

      {/* Fraud Amount */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] text-slate-600 font-medium">Suspicious Flow</span>
        <span className="sentinel-mono text-[11px] font-bold text-amber-400">{fraudStr}</span>
      </div>

      <Divider />

      {/* Network Stats */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1">
          <Network className="w-3 h-3 text-slate-600" />
          <span className="sentinel-mono text-[10px] text-slate-400">{chainDepth}-hop</span>
        </div>
        <span className="sentinel-mono text-[10px] text-slate-500">{nodeCount} nodes</span>
        <span className="sentinel-mono text-[10px] text-slate-500">{edgeCount} txns</span>
      </div>

      <Divider />

      {/* Status */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
        <Clock className="w-3 h-3 text-slate-600" />
        <span className="sentinel-mono text-[9px] text-slate-500">{caseData.status || 'NEW'}</span>
        <span className="text-[9px] text-slate-600">•</span>
        <span className="sentinel-mono text-[9px] text-slate-500">
          GW: {caseData.golden_window_minutes || 0}min
        </span>
      </div>
    </div>
  );
};

const Divider = () => <div className="w-px h-4 bg-slate-800 shrink-0" />;

export default CaseBanner;
