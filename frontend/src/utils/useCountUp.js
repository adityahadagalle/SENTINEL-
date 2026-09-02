import { useState, useEffect } from 'react';

/**
 * useCountUp — Animates a number from start to end over a duration using easeOutCubic.
 */
export const useCountUp = (endValue = 0, duration = 750, decimals = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(endValue) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }

    let startTime = null;
    let animId = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = start + (end - start) * easeOutCubic(progress);
      setCount(Number(current.toFixed(decimals)));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    animId = requestAnimationFrame(step);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [endValue, duration, decimals]);

  return count;
};
