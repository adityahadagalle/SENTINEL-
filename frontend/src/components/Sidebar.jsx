import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Activity, Briefcase, LayoutDashboard, ChevronLeft, ChevronRight, LogOut, Flame } from 'lucide-react';
import AttackModeToggle from './AttackModeToggle';
import Avatar from './Avatar';

const Sidebar = ({ role, connectionStatus, casesCount = 0, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const isLive = connectionStatus === 'LIVE';
  const isOffline = connectionStatus === 'OFFLINE';
  const statusColor = isLive ? '#10B981' : isOffline ? '#EF4444' : '#F59E0B';
  const statusLabel = isLive ? 'LIVE' : isOffline ? 'OFFLINE' : 'RECONNECT';
  const navItems = [
    { to: '/feed',      label: 'Transaction Stream',    icon: Activity,       badge: 'LIVE' },
    { to: '/cases',     label: 'Investigation Queue',   icon: Briefcase,      count: casesCount },
    { to: '/dashboard', label: 'Analytics & Telemetry', icon: LayoutDashboard },
  ];
  return (
    <aside
      style={{ width: collapsed ? 56 : 220 }}
      className="h-screen bg-[#060C17] border-r border-[#1A2640] flex flex-col justify-between shrink-0 select-none z-30 transition-[width] duration-200 ease-out overflow-hidden"
    >
      <div>
        <div style={{ height: 48 }} className="flex items-center justify-between border-b border-[#1A2640] px-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            {!collapsed && (
              <div className="truncate min-w-0">
                <div className="text-[11px] font-bold tracking-[0.08em] text-slate-100 uppercase leading-tight">SENTINEL</div>
                <div className="text-[8px] font-mono text-slate-600 tracking-[0.12em] uppercase leading-tight mt-0.5">Fraud SOC v2</div>
              </div>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-slate-300 transition-colors shrink-0">
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>
        <div className="py-2 space-y-0.5 px-2">
          {!collapsed && (
            <div className="px-2 pt-2 pb-1.5">
              <span className="text-[8px] font-mono font-bold uppercase tracking-[0.16em] text-slate-700">Operations</span>
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} title={collapsed ? item.label : undefined}
                className={({ isActive }) => `s-nav-item ${isActive ? 's-nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate flex-1 text-[11px]">{item.label}</span>
                    {item.badge && (
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-emerald-500/8 text-emerald-400 border border-emerald-500/15 uppercase tracking-wider">{item.badge}</span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-sm text-[9px] font-mono font-bold bg-[#1A2640] text-slate-300 border border-[#243352]">{item.count}</span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
        {!collapsed && (
          <div className="mx-2 mt-2 border-t border-[#1A2640] pt-2">
            <div className="px-2 pb-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-mono font-bold uppercase tracking-[0.16em] text-slate-700">Simulation</span>
                <Flame className="w-2.5 h-2.5 text-amber-600" />
              </div>
            </div>
            <AttackModeToggle />
          </div>
        )}
      </div>
      <div className="border-t border-[#1A2640] bg-[#040810]">
        <div className={`flex items-center gap-2 px-3 py-2 border-b border-[#1A2640] ${collapsed ? 'justify-center' : ''}`}>
          <span className="relative flex w-2 h-2 shrink-0">
            <span className="absolute inset-0 rounded-full animate-ping opacity-50" style={{ background: statusColor }} />
            <span className="relative rounded-full w-2 h-2" style={{ background: statusColor }} />
          </span>
          {!collapsed && (
            <>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest flex-1" style={{ color: statusColor }}>{statusLabel}</span>
              <span className="text-[8px] font-mono text-slate-700">SOC</span>
            </>
          )}
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <Avatar name={role === 'admin' ? 'Analyst Raj' : 'Viewer Ops'} size="sm" />
          {!collapsed && (
            <>
              <div className="truncate flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-slate-300 truncate leading-tight">{role === 'admin' ? 'Analyst Raj' : 'Viewer Ops'}</div>
                <div className="text-[8px] font-mono text-slate-700 uppercase tracking-wider leading-tight">{role}</div>
              </div>
              <button onClick={onLogout} title="End session" className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-rose-500/5 transition-colors">
                <LogOut className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
