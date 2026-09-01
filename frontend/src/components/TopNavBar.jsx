import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Search, Bell, LogOut, Activity, LayoutDashboard, Briefcase, TrendingUp, Command } from 'lucide-react';

/**
 * TopNavBar — Enterprise top navigation bar
 * Matches Stitch SENTINEL Dark Enterprise reference
 */
const TopNavBar = ({ role, connectionStatus, casesCount = 0, onLogout }) => {
  const navTabs = [
    { to: '/feed', label: 'Monitoring', icon: Activity },
    { to: '/dashboard', label: 'Analytics', icon: TrendingUp },
    { to: '/cases', label: 'Cases', icon: Briefcase },
  ];

  const statusColor = connectionStatus === 'LIVE' ? '#10B981' : connectionStatus === 'OFFLINE' ? '#EF4444' : '#F59E0B';

  return (
    <header className="sentinel-topnav flex items-center justify-between px-5 h-[52px] shrink-0 select-none z-30">
      {/* Left: Logo + Nav Tabs */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <NavLink to="/feed" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shadow-[0_0_14px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-shadow">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold tracking-tight text-slate-100">SENTINEL</span>
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest hidden lg:inline">v2.0</span>
          </div>
        </NavLink>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-800" />

        {/* Nav Tabs */}
        <nav className="flex items-center gap-0.5">
          {navTabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/12 text-blue-400 shadow-[inset_0_0_12px_rgba(59,130,246,0.06)]'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex items-center max-w-md flex-1 mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <input
            type="text"
            placeholder="Search investigations, accounts, transactions..."
            className="w-full pl-9 pr-14 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all font-medium"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-800/80 border border-slate-700 rounded text-[9px] text-slate-500 font-mono">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </div>
      </div>

      {/* Right: Status + Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900/40">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: statusColor }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: statusColor }} />
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: statusColor }}>
            {connectionStatus}
          </span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
          <Bell className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          {casesCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center px-1 bg-red-500 text-white text-[8px] font-bold rounded-full border-2 border-[#0D1829]">
              {casesCount > 9 ? '9+' : casesCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-800" />

        {/* User Menu */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-semibold text-slate-300 leading-none">
              {role === 'admin' ? 'Analyst Raj' : 'Viewer'}
            </div>
            <div className="text-[9px] font-mono text-slate-600 mt-0.5 uppercase tracking-wider">
              {role}
            </div>
          </div>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold border ${
            role === 'admin'
              ? 'bg-blue-600/15 text-blue-400 border-blue-500/25'
              : 'bg-slate-700/40 text-slate-400 border-slate-600/30'
          }`}>
            {role === 'admin' ? 'AR' : 'V'}
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md hover:bg-slate-800/60 text-slate-600 hover:text-slate-400 transition-all"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
