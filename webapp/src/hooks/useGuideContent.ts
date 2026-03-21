import { useEffect, useState } from 'react';
import { GUIDE_CONTENT_EVENT, readGuideContent } from '../data/guideContent';
import type { GuideContentStore } from '../types';

export function useGuideContent() {
  const [content, setContent] = useState<GuideContentStore>(() => readGuideContent());

  useEffect(() => {
    const sync = () => {
      setContent(readGuideContent());
    };

    window.addEventListener(GUIDE_CONTENT_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(GUIDE_CONTENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return content;
}
