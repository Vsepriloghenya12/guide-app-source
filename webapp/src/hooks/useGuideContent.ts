import { useEffect, useState } from 'react';
import type { PublicGuideContent } from '../types';
import { fetchPublicBootstrap } from '../lib/api';

const initialState: PublicGuideContent = {
  restaurants: [],
  wellness: [],
  featured: [],
  tips: []
};

export function useGuideContent() {
  const [content, setContent] = useState<PublicGuideContent>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchPublicBootstrap();
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные приложения.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload().catch(() => undefined);
  }, []);

  return {
    ...content,
    loading,
    error,
    reload
  };
}
