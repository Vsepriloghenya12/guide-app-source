import { useEffect, useState } from 'react';
import type { OwnerBootstrap } from '../types';
import { fetchOwnerBootstrap } from '../lib/api';

const initialState: OwnerBootstrap = {
  restaurants: [],
  wellness: [],
  settings: { homeTips: [] }
};

export function useOwnerBootstrap() {
  const [data, setData] = useState<OwnerBootstrap>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = async () => {
    try {
      setLoading(true);
      setError('');
      setData(await fetchOwnerBootstrap());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить owner-CMS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload().catch(() => undefined);
  }, []);

  return {
    ...data,
    loading,
    error,
    reload
  };
}
