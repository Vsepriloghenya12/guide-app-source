import { useEffect, useState } from 'react';
import { GUIDE_CONTENT_EVENT, readGuideContent, syncGuideContentFromServer } from '../data/guideContent';
import type { GuideContentStore } from '../types';

export function useGuideContent() {
  const [content, setContent] = useState<GuideContentStore>(() => readGuideContent());

  useEffect(() => {
    const syncLocal = () => {
      setContent(readGuideContent());
    };

    window.addEventListener(GUIDE_CONTENT_EVENT, syncLocal);
    window.addEventListener('storage', syncLocal);
    void syncGuideContentFromServer().then((nextContent) => setContent(nextContent));

    return () => {
      window.removeEventListener(GUIDE_CONTENT_EVENT, syncLocal);
      window.removeEventListener('storage', syncLocal);
    };
  }, []);

  return content;
}
