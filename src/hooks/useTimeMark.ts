import { useEffect, useRef } from 'react';

import { trackPerf } from '../analytics';

// Fires a PERF_MARK event exactly once when `ready` becomes true.
// `startRef` defaults to component mount time.
export function useTimeMark(label: string, ready: boolean): void {
  const startTs = useRef(Date.now());
  const fired = useRef(false);

  useEffect(() => {
    if (ready && !fired.current) {
      fired.current = true;
      trackPerf(label, Date.now() - startTs.current);
    }
  }, [ready, label]);
}
