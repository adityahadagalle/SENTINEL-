import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Activity, Briefcase, Network, ArrowRight, ShieldAlert } from 'lucide-react';
import { maskAccount } from '../utils/maskAccount';

/**
 * SearchModal Component
 * Global investigation search palette triggered via Cmd+K / Ctrl+K.
 */
const SearchModal = ({ isOpen, onClose, cases = [], transactions = [], role = 'viewer' }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          window.dispatchEvent(new CustomEvent('toggle_search_modal'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search cases
  const matchingCases = q
    ? cases.filter(c => 
        (c.case_id || '').toLowerCase().includes(q) || 
        (c.primary_tx_id && c.primary_tx_id.toLowerCase().includes(q)) ||
        (c.chain && c.chain.some(acc => acc.toLowerCase().includes(q)))
      ).slice(0, 5)
    : cases.slice(0, 4);

  // Search transactions
  const matchingTx = q
    ? transactions.filter(t => 
        (t.tx_id && t.tx_id.toLowerCase().includes(q)) ||
        (t.sender_account && t.sender_account.toLowerCase().includes(q)) ||
        (t.receiver_account && t.receiver_account.toLowerCase().includes(q)) ||
        (t.reason && t.reason.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  const handleSelectCase = (caseId) => {
    onClose();
    navigate(`/graph/${caseId}`);
  };

  const handleSelectFeed = () => {
    onClose();
    navigate('/feed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#0C1220] border border-[#1A2640] rounded-sm shadow-2xl shadow-black overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1A2640] bg-[#040810]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases, transaction IDs, account numbers, or flag reasons..."
            className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none font-mono font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-[#0F1926] border border-[#1A2640] rounded-sm">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-3">
          {/* Cases Results */}
          <div>
            <div className="px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500 font-mono">
              Investigation Cases ({matchingCases.length})
            </div>
            {matchingCases.length > 0 ? (
              <div className="space-y-1 mt-1">
                {matchingCases.map((c) => (
                  <div
                    key={c.case_id}
                    onClick={() => handleSelectCase(c.case_id)}
                    className="flex items-center justify-between p-2 rounded-sm hover:bg-[#131E2E] cursor-pointer transition-colors group border border-transparent hover:border-[#1A2640]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-sm bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                        <Network className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {c.case_id}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Exposure: ₹{Number(c.total_fraud_amount || 0).toLocaleString('en-IN')} • Risk {c.risk_level || 90}/100 • Status: {c.status}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 group-hover:text-blue-400 font-mono">
                      <span>Open Graph</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 text-[10px] text-slate-500 italic font-mono">No matching cases found</div>
            )}
          </div>

          {/* Transactions Results */}
          {matchingTx.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500 font-mono">
                Transactions ({matchingTx.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchingTx.map((t) => (
                  <div
                    key={t.tx_id}
                    onClick={handleSelectFeed}
                    className="flex items-center justify-between p-2 rounded-sm hover:bg-[#131E2E] cursor-pointer transition-colors group border border-transparent hover:border-[#1A2640]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-sm bg-amber-600/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-mono font-bold text-slate-200">
                          {role === 'admin' ? t.tx_id : '••••••••'} • ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          {role === 'admin' ? t.sender_account : maskAccount(t.sender_account)} → {role === 'admin' ? t.receiver_account : maskAccount(t.receiver_account)} • {t.reason || 'Routine'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#0F1926] text-slate-300 border border-[#1A2640]">
                      Score {t.risk_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#040810] border-t border-[#1A2640] flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <span>Navigation: <kbd className="text-slate-400">ESC</kbd> to dismiss • Click to select</span>
          <span className="text-slate-600">SENTINEL Global Index</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
