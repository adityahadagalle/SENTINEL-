import React, { useState } from 'react';
import { setRoleGlobal } from '../roleStore';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        setRoleGlobal('admin');
      } else if (username === 'viewer' && password === 'viewer123') {
        setRoleGlobal('viewer');
      } else {
        setError('Invalid credentials. Access denied.');
        setLoading(false);
      }
    }, 600);
  };

  const handleQuickViewer = () => { setRoleGlobal('viewer'); };

  return (
    <div className="fixed inset-0 flex bg-[#080D18] overflow-hidden select-none">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#060B14] border-r border-[#1A2640] p-10 relative overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/6 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <div className="text-[12px] font-bold tracking-[0.1em] text-slate-100 uppercase">SENTINEL</div>
              <div className="text-[9px] font-mono text-slate-700 tracking-[0.14em] uppercase">Fraud SOC v2.0</div>
            </div>
          </div>

          <div className="space-y-5">
            <h1 className="text-2xl font-bold text-slate-100 leading-tight tracking-tight">
              Financial Crime<br/>Intelligence Platform
            </h1>
            <p className="text-[12px] text-slate-600 leading-relaxed font-mono">
              Real-time transaction monitoring, AI-driven risk scoring, and multi-hop fraud investigation for enterprise fraud operations.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { label: 'TX Monitored', value: '1.2M+', color: '#60A5FA' },
            { label: 'Detection Rate', value: '99.3%', color: '#34D399' },
            { label: 'Avg Response', value: '<2min', color: '#FBBF24' },
            { label: 'Networks Live', value: '4', color: '#A78BFA' },
          ].map((stat, i) => (
            <div key={i} className="bg-[#0F1926] border border-[#1A2640] rounded px-3 py-2.5">
              <div className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-700">{stat.label}</div>
              <div className="text-[18px] font-mono font-bold leading-tight mt-0.5" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-[8px] font-mono text-slate-800 uppercase tracking-widest">
          SENTINEL PROD-2.0 · ISO 27001 · SOC 2 TYPE II
        </div>
      </div>

      {/* Right — auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[360px]">
          <div className="mb-8">
            <div className="text-[9px] font-mono font-bold uppercase tracking-[0.16em] text-slate-700 mb-2">
              Secure Authentication
            </div>
            <h2 className="text-xl font-bold text-slate-100">Sign In to SENTINEL</h2>
            <p className="text-[11px] text-slate-600 mt-1 font-mono">Enterprise Fraud Operations Console</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="s-label block mb-1.5">Terminal Identity</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700" />
                <input
                  type="text"
                  placeholder="admin  or  viewer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="s-input w-full pl-9 py-2.5 text-[12px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="s-label block mb-1.5">Access Cipher</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="s-input w-full pl-9 py-2.5 text-[12px]"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="px-3 py-2 bg-rose-500/8 border border-rose-500/15 rounded text-[10px] font-mono text-rose-400">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="s-btn-primary w-full justify-center py-3 text-[11px] mt-1"
            >
              {loading ? 'Authenticating...' : 'Establish Secure Link'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#1A2640]">
            <button
              onClick={handleQuickViewer}
              className="text-[10px] font-mono text-slate-600 hover:text-blue-400 transition-colors"
            >
              Continue as public viewer →
            </button>
            <div className="mt-3 space-y-1 text-[9px] font-mono text-slate-800">
              <div>Admin: admin / admin123</div>
              <div>Viewer: viewer / viewer123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
