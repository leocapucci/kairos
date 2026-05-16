import { useEffect } from 'react';

import { E, track } from '../analytics';

export function useScreenTracking(screen: string): void {
  useEffect(() => {
    track(E.SCREEN_VIEWED, { screen });
  }, [screen]);
}
