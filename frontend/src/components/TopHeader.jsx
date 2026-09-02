import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { Search, Command, Download, Bell, Activity, Briefcase, BarChart3 } from 'lucide-react';
import Avatar from './Avatar';

/**
 * TopHeader — Persistent top navigation bar.
 *
 * Layout:
 *   [SENTINEL logo] | [Nav links] | [Search ⌘K] | [Bell] | [UTC clock] | [Export] | [SOC pill] | [User avatar]
 *
 * Present on EVERY screen. Height: 48px.
 */
const NAV_LINKS = [
  { to: '/feed',      label: 'Transaction Stream', Icon: Activity    },
  { to: '/cases',     label: 'Investigation Queue', Icon: Briefcase  },
  { to: '/dashboard', label: 'Analytics',           Icon: BarChart3  },
];

const TopHeader = ({ connectionStatus, role, onOpenSearch }) => {
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [bellPulse, setBellPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Brief bell pulse every ~30s to hint at live data
  useEffect(() => {
    const id = setInterval(() => {
      setBellPulse(true);
      setTimeout(() => setBellPulse(false), 1200);
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const utcTime = time.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' });
  const utcDate = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

  const analystName = role === 'admin' ? 'Analyst Raj' : 'Viewer Mode';

  return (
    <header
      className="flex items-center border-b border-[#1A2640] bg-[#06091180] backdrop-blur-sm shrink-0 select-none z-20 px-4 gap-4"
      style={{ height: 48 }}
    >
      {/* ── Logo mark ── */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded-sm bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
          <span className="text-[9px] font-mono font-black text-blue-400">S</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.12em] hidden lg:block">
          SENTINEL
        </span>
      </div>

      {/* ── Divider ── */}
      <div className="w-px h-5 bg-[#1A2640]" />

      {/* ── Primary navigation links ── */}
      <nav className="flex items-center gap-0.5">
        {NAV_LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-mono font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-[#0F1926] border border-transparent'
              }`
            }
          >
            <Icon className="w-3 h-3" />
            <span className="hidden md:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── Search bar — center ── */}
      <div className="flex-1 max-w-xs mx-auto hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#060B14] border border-[#1A2640] hover:border-[#243352] text-slate-600 hover:text-slate-400 transition-colors text-[10px] font-mono rounded-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3 h-3" />
            <span className="truncate">Search investigations, accounts, cases...</span>
          </div>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#0F1926] border border-[#1A2640] rounded-sm text-[8px] font-mono text-slate-600 shrink-0">
            <Command className="w-2 h-2" />K
          </kbd>
        </button>
      </div>

      {/* ── Right utilities ── */}
      <div className="ml-auto flex items-center gap-2.5">
        {/* UTC clock */}
        <div className="hidden lg:flex flex-col items-end">
          <span className="text-[10px] font-mono font-bold text-slate-300 leading-tight">
            {utcTime} <span className="text-slate-700 font-normal">UTC</span>
          </span>
          <span className="text-[8px] font-mono text-slate-700 leading-tight">{utcDate}</span>
        </div>

        <div className="w-px h-5 bg-[#1A2640]" />

        {/* Notification bell */}
        <button
          className={`relative p-1.5 rounded-sm transition-colors ${bellPulse ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300 hover:bg-[#0F1926]'}`}
          title="Alerts"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        {/* Export */}
        <button
          onClick={() => { if (role === 'admin') window.location.href = 'http://127.0.0.1:8000/export/sentinel_audit.csv'; }}
          disabled={role !== 'admin'}
          className={`hidden lg:flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider transition-all border rounded-sm ${
            role === 'admin'
              ? 'bg-transparent hover:bg-[#0F1926] text-slate-500 hover:text-slate-300 border-[#1A2640] hover:border-[#243352]'
              : 'opacity-25 cursor-not-allowed bg-transparent border-[#1A2640] text-slate-700'
          }`}
          title="Export CSV Audit Trail"
        >
          <Download className="w-3 h-3" />
          <span>Export</span>
        </button>

        {/* SOC status pill */}
        <div className={`flex items-center gap-1.5 px-2 py-1 border rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider ${
          connectionStatus === 'LIVE'
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'
            : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {connectionStatus === 'LIVE' ? 'SOC Active' : 'Offline'}
        </div>

        <div className="w-px h-5 bg-[#1A2640]" />

        {/* User avatar */}
        <div className="flex items-center gap-1.5">
          <Avatar name={analystName} size="sm" />
          <span className="text-[9px] font-mono text-slate-500 hidden lg:block">{analystName}</span>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
