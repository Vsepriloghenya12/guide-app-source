import { useEffect, useMemo, useState } from 'react';
import { GUIDE_CONTENT_EVENT, readGuideContent, syncGuideContentFromServer, type GuideContentScope } from '../data/guideContent';
import type { GuideContentStore } from '../types';

type UseGuideContentOptions = {
  scope?: GuideContentScope;
};

export function useGuideContent(options: UseGuideContentOptions = {}) {
  const scope = options.scope ?? 'public';
  const [content, setContent] = useState<GuideContentStore>(() => readGuideContent());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const syncLocal = () => {
      if (!active) return;
      setContent(readGuideContent());
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const nextContent = await syncGuideContentFromServer(scope);
        if (!active) return;
        setContent(nextContent);
      } catch (nextError) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : 'Не удалось загрузить контент.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    window.addEventListener(GUIDE_CONTENT_EVENT, syncLocal);
    window.addEventListener('storage', syncLocal);
    void load();

    return () => {
      active = false;
      window.removeEventListener(GUIDE_CONTENT_EVENT, syncLocal);
      window.removeEventListener('storage', syncLocal);
    };
  }, [scope]);

  return useMemo(() => ({ ...content, loading, error }), [content, loading, error]);
}
