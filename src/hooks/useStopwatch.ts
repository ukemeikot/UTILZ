import { useEffect, useRef, useState } from 'react';

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startedAt = useRef<number | null>(null);
  const carriedElapsed = useRef(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const base = startedAt.current ?? now;
      setElapsed(carriedElapsed.current + (now - base));
    }, 40);

    return () => clearInterval(interval);
  }, [isRunning]);

  const start = () => {
    startedAt.current = Date.now();
    setIsRunning(true);
  };

  const stop = () => {
    carriedElapsed.current = elapsed;
    setIsRunning(false);
  };

  const reset = () => {
    startedAt.current = null;
    carriedElapsed.current = 0;
    setElapsed(0);
    setLaps([]);
    setIsRunning(false);
  };

  const lap = () => {
    if (elapsed > 0) {
      setLaps((current) => [elapsed, ...current]);
    }
  };

  return {
    elapsed,
    isRunning,
    laps,
    start,
    stop,
    reset,
    lap,
  };
}
