import React, { useState, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

/**
 * TimelineScrubber — Bottom timeline component for the Investigation Workstation
 * Shows transaction events along a time axis with flagged markers
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
        flagged: Number(e.amount || 0) > 100000 || (e.label && e.label.includes('suspicious'))
      }))
      .filter(t => t.time)
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [edges]);

  const total = timePoints.length || edges.length;
  const current = Math.min(currentIndex + 1, total);
  const progressPct = total > 0 ? (current / total) * 100 : 0;

  // Format time for display
  const formatTick = (timeStr) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr.slice(0, 8);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return timeStr.slice(0, 8);
    }
  };

  // Generate evenly spaced ticks
  const ticks = useMemo(() => {
    if (timePoints.length < 2) return [];
    const count = Math.min(timePoints.length, 8);
    const step = Math.floor(timePoints.length / count);
    return Array.from({ length: count }, (_, i) => {
      const tp = timePoints[Math.min(i * step, timePoints.length - 1)];
      return {
        pct: ((i * step) / (timePoints.length - 1)) * 100,
        label: formatTick(tp.time)
      };
    });
  }, [timePoints]);

  // Flagged event positions
  const flags = useMemo(() => {
    if (timePoints.length < 2) return [];
    return timePoints
      .filter(t => t.flagged)
      .map(t => ({
        pct: (timePoints.indexOf(t) / (timePoints.length - 1)) * 100
      }));
  }, [timePoints]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStepBack = () => onTimeChange?.(Math.max(0, currentIndex - 1));
  const handleStepForward = () => onTimeChange?.(Math.min(total - 1, currentIndex + 1));

  return (
    <div className="timeline-scrubber">
      {/* Controls */}
      <div className="timeline-controls">
        <button className="timeline-btn" onClick={handleStepBack} title="Previous">
          <SkipBack className="w-3 h-3" />
        </button>
        <button
          className={`timeline-btn ${isPlaying ? 'active' : ''}`}
          onClick={handlePlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <button className="timeline-btn" onClick={handleStepForward} title="Next">
          <SkipForward className="w-3 h-3" />
        </button>
      </div>

      {/* Track */}
      <div className="timeline-track">
        {/* Progress */}
        <div className="timeline-progress" style={{ width: `${progressPct}%` }} />

        {/* Ticks */}
        {ticks.map((tick, i) => (
          <div key={i}>
            <div className="timeline-tick" style={{ left: `${tick.pct}%` }} />
            <div className="timeline-tick-label" style={{ left: `${tick.pct}%` }}>
              {tick.label}
            </div>
          </div>
        ))}

        {/* Flagged Events */}
        {flags.map((flag, i) => (
          <div key={`f-${i}`} className="timeline-flag" style={{ left: `${flag.pct}%` }} />
        ))}
      </div>

      {/* Counter */}
      <div className="timeline-counter">
        <span className="text-slate-300">{current}</span>
        <span className="text-slate-600"> / {total}</span>
        <span className="text-slate-700 text-[8px] ml-1">TXN</span>
      </div>
    </div>
  );
};

export default TimelineScrubber;
