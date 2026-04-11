import { useEffect, useState } from 'react';

export function useCountdown(initialSeconds = 300) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || remaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setIsRunning(false);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, remaining]);

  return {
    remaining,
    isRunning,
    setRemaining,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: (value = initialSeconds) => {
      setRemaining(value);
      setIsRunning(false);
    },
  };
}
