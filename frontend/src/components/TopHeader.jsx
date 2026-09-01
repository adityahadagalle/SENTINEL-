import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Search, Command, Download, Clock } from 'lucide-react';

const TopHeader = ({ connectionStatus, role, onOpenSearch }) => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const getPageLabel = () => {
    const path = location.pathname;
    if (path.startsWith('/graph/')) return `Investigation / ${path.replace('/graph/', '')}`;
    if (path === '/cases')     return 'Investigation Queue';
    if (path === '/dashboard') return 'Analytics & Telemetry';
    return 'Live Transaction Stream';
  };

  const utcTime = time.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' });
  const utcDate = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

  return (
    <header style={{ height: 44 }} className="flex items-center border-b border-[#1A2640] bg-[#06091180] backdrop-blur-sm shrink-0 select-none z-20 px-4 gap-3">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono min-w-0">
        <span className="text-slate-700 uppercase tracking-widest font-bold">SENTINEL</span>
        <span className="text-slate-800">/</span>
        <span className="text-slate-400 font-medium truncate">{getPageLabel()}</span>
      </div>

      {/* Search bar — center */}
      <div className="flex-1 max-w-sm mx-4 hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#060B14] border border-[#1A2640] hover:border-[#243352] text-slate-600 hover:text-slate-400 transition-colors text-[10px] font-mono rounded-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3 h-3" />
            <span>Search investigations, accounts, cases...</span>
          </div>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#0F1926] border border-[#1A2640] rounded text-[8px] font-mono text-slate-600">
            <Command className="w-2 h-2" />K
          </kbd>
        </button>
      </div>

      {/* Right utility strip */}
      <div className="ml-auto flex items-center gap-3">
        {/* UTC clock */}
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-mono font-bold text-slate-300 leading-tight">{utcTime} <span className="text-slate-700 font-normal">UTC</span></span>
          <span className="text-[8px] font-mono text-slate-700 leading-tight">{utcDate}</span>
        </div>

        <div className="w-px h-5 bg-[#1A2640]" />

        {/* Export */}
        <button
          onClick={() => { if (role === 'admin') window.location.href = 'http://127.0.0.1:8000/export/sentinel_audit.csv'; }}
          disabled={role !== 'admin'}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider transition-all border rounded-sm ${
            role === 'admin'
              ? 'bg-transparent hover:bg-[#0F1926] text-slate-500 hover:text-slate-300 border-[#1A2640] hover:border-[#243352]'
              : 'opacity-25 cursor-not-allowed bg-transparent border-[#1A2640] text-slate-700'
          }`}
          title="Export CSV Audit Trail"
        >
          <Download className="w-3 h-3" />
          <span className="hidden lg:inline">Audit Export</span>
        </button>

        {/* SOC status pill */}
        <div className={`flex items-center gap-1.5 px-2 py-1 border rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider ${
          connectionStatus === 'LIVE'
            ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-500'
            : 'bg-rose-500/5 border-rose-500/15 text-rose-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {connectionStatus === 'LIVE' ? 'SOC Active' : 'Offline'}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
