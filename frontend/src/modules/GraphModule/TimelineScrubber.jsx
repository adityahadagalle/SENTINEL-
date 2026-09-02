import React, { useState, useMemo, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Clock } from 'lucide-react';

/**
 * TimelineScrubber — Bottom timeline component for the Investigation Workstation
 * Shows transaction events along a time axis with flagged markers and interactive scrub.
 */
const TimelineScrubber = ({ edges = [], currentIndex = 0, onTimeChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract timestamps from edges and sort chronologically
  const timePoints = useMemo(() => {
    return edges
      .map((e, idx) => ({
        idx,
        time: e.time || e.timestamp || '',
        amount: Number(e.amount || 0),
        tx_id: e.tx_id || e.id || '',
        channel: e.channel || 'UPI',
        flagged: Number(e.amount || 0) > 100000 || e.is_suspicious || (e.label && e.label.includes('suspicious'))
      }))
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [edges]);

  const total = Math.max(timePoints.length, 5);
  const current = Math.min(currentIndex + 1, total);
  const progressPct = total > 0 ? (current / total) * 100 : 0;

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onTimeChange?.((prev) => {
        const next = (prev + 1) % total;
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, total, onTimeChange]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStepBack = () => onTimeChange?.(Math.max(0, currentIndex - 1));
  const handleStepForward = () => onTimeChange?.(Math.min(total - 1, currentIndex + 1));

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-[#040810] border-t border-[#1A2640] shrink-0 select-none">
      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleStepBack}
          className="p-1.5 rounded-sm hover:bg-[#131E2E] text-slate-400 hover:text-slate-200 transition-colors"
          title="Previous Flow Step"
        >
          <SkipBack className="w-3 h-3" />
        </button>
        <button
          onClick={handlePlayPause}
          className={`p-1.5 rounded-sm transition-colors ${isPlaying ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'hover:bg-[#131E2E] text-slate-400 hover:text-slate-200'}`}
          title={isPlaying ? 'Pause Sequence' : 'Auto Play Sequence'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
        </button>
        <button
          onClick={handleStepForward}
          className="p-1.5 rounded-sm hover:bg-[#131E2E] text-slate-400 hover:text-slate-200 transition-colors"
          title="Next Flow Step"
        >
          <SkipForward className="w-3 h-3" />
        </button>
      </div>

      <div className="w-px h-4 bg-[#1A2640]" />

      {/* Scrub Track */}
      <div className="flex-1 relative flex items-center h-4 cursor-pointer" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickPct = (e.clientX - rect.left) / rect.width;
        const targetIdx = Math.min(total - 1, Math.max(0, Math.floor(clickPct * total)));
        onTimeChange?.(targetIdx);
      }}>
        {/* Base Track */}
        <div className="w-full h-1 bg-[#1A2640] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step Ticks */}
        {Array.from({ length: total }).map((_, i) => {
          const pct = ((i + 0.5) / total) * 100;
          const isActive = i <= currentIndex;
          return (
            <div
              key={i}
              className={`absolute -translate-x-1/2 w-2 h-2 rounded-full border transition-all ${
                i === currentIndex
                  ? 'bg-blue-400 border-blue-200 ring-2 ring-blue-500/40 scale-125'
                  : isActive
                  ? 'bg-blue-600 border-blue-400'
                  : 'bg-[#0F1926] border-[#1A2640]'
              }`}
              style={{ left: `${pct}%` }}
              title={`Hop ${i+1}`}
            />
          );
        })}
      </div>

      <div className="w-px h-4 bg-[#1A2640]" />

      {/* Step Counter */}
      <div className="flex items-center gap-1.5 font-mono text-[10px]">
        <Clock className="w-3 h-3 text-slate-500" />
        <span className="text-slate-200 font-bold">Step {current}</span>
        <span className="text-slate-600">/ {total}</span>
      </div>
    </div>
  );
};

export default TimelineScrubber;
