import { useEffect, useState } from 'react';
import { getDailyVerse } from '../services/api/bible';

export function useBible() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDailyVerse()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return { data };
}
