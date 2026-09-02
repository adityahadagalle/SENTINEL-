import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Clock, 
  CheckCircle2, AlertTriangle, Network, ShieldCheck, Zap, Sparkles 
} from 'lucide-react';

/**
 * Autonomous Investigation Stages Pipeline
 */
const INVESTIGATION_STAGES = [
  { step: 1, title: 'Txn Ingestion', desc: 'Ingested primary clearing event', time: '19:02:11', icon: Zap, color: '#3B82F6' },
  { step: 2, title: 'Anomaly Flagged', desc: 'High-velocity threshold burst', time: '19:02:12', icon: AlertTriangle, color: '#F59E0B' },
  { step: 3, title: 'Network Expansion', desc: 'Mapped 3-hop mule perimeter', time: '19:02:13', icon: Network, color: '#3B82F6' },
  { step: 4, title: 'Entity Enrichment', desc: 'KYC & Device telemetry linked', time: '19:02:14', icon: ShieldCheck, color: '#60A5FA' },
  { step: 5, title: 'Pattern Classified', desc: 'Structuring Pass-Through signature', time: '19:02:16', icon: Sparkles, color: '#8B5CF6' },
  { step: 6, title: 'Risk Assessed', desc: '100 Critical Risk confirmed', time: '19:02:17', icon: AlertTriangle, color: '#EF4444' },
  { step: 7, title: 'Action Formulated', desc: 'Freeze & SAR recommendation ready', time: '19:02:18', icon: CheckCircle2, color: '#10B981' },
];

/**
 * TimelineScrubber — Autonomous Investigation Stepper & Chronological Event Scrubber
 */
const TimelineScrubber = ({ edges = [], currentIndex = 0, onTimeChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const totalStages = INVESTIGATION_STAGES.length;
  const currentStage = Math.min(currentIndex, totalStages - 1);

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onTimeChange?.((prev) => {
        const next = (prev + 1) % totalStages;
        return next;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, [isPlaying, totalStages, onTimeChange]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStepBack = () => onTimeChange?.(Math.max(0, currentStage - 1));
  const handleStepForward = () => onTimeChange?.(Math.min(totalStages - 1, currentStage + 1));

  return (
    <div className="flex flex-col bg-[#050913] border-t border-[#1A2640] shrink-0 select-none">
      
      {/* Top Header: Stepper Progress */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#121B2D] bg-[#070D18]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-[8px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
            Autonomous Investigation Pipeline
          </span>
          <span className="text-[8px] font-mono text-slate-600">·</span>
          <span className="text-[9px] font-mono text-blue-300 font-bold">
            Stage 0{currentStage + 1} of 07: {INVESTIGATION_STAGES[currentStage].title}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleStepBack}
            className="p-1 rounded-sm hover:bg-[#101A2B] text-slate-400 hover:text-slate-200 transition-colors"
            title="Previous Stage"
          >
            <SkipBack className="w-3 h-3" />
          </button>
          <button
            onClick={handlePlayPause}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase transition-all ${
              isPlaying 
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.3)]' 
                : 'bg-[#0C1424] hover:bg-[#131E2E] text-slate-300 border border-[#1E2D4A]'
            }`}
          >
            {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : 'AUTO PLAY'}</span>
          </button>
          <button
            onClick={handleStepForward}
            className="p-1 rounded-sm hover:bg-[#101A2B] text-slate-400 hover:text-slate-200 transition-colors"
            title="Next Stage"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Interactive Stage Track */}
      <div className="grid grid-cols-7 divide-x divide-[#141E33] overflow-x-auto">
        {INVESTIGATION_STAGES.map((stg, i) => {
          const Icon = stg.icon;
          const isSelected = i === currentStage;
          const isPassed = i < currentStage;

          return (
            <div
              key={stg.step}
              onClick={() => onTimeChange?.(i)}
              className={`p-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                isSelected 
                  ? 'bg-blue-950/20 border-t-2 border-t-blue-500 shadow-inner' 
                  : isPassed
                  ? 'bg-[#080E1B]/50 hover:bg-[#0C1527]'
                  : 'bg-[#050913] hover:bg-[#0A1122] opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[8px] font-mono font-bold ${isSelected ? 'text-blue-400' : isPassed ? 'text-slate-400' : 'text-slate-600'}`}>
                  0{stg.step}
                </span>
                <span className="text-[7.5px] font-mono text-slate-500 tabular-nums">
                  {stg.time}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-3 h-3 shrink-0" style={{ color: isSelected ? stg.color : '#64748B' }} />
                <span className={`text-[9px] font-mono font-semibold truncate ${isSelected ? 'text-slate-100' : isPassed ? 'text-slate-300' : 'text-slate-500'}`}>
                  {stg.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default TimelineScrubber;
