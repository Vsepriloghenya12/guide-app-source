import { useEffect, useState } from 'react';
import {
  GUIDE_CONTENT_EVENT,
  getDefaultGuideContent,
  readGuideContent,
  type GuideContentStore
} from '../data/guideContent';

export function useGuideContent() {
  const [content, setContent] = useState<GuideContentStore>(getDefaultGuideContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const sync = async () => {
      const nextContent = await readGuideContent();
      if (!isMounted) {
        return;
      }
      setContent(nextContent);
      setIsLoading(false);
    };

    sync();

    const handleUpdate = () => {
      void sync();
    };

    window.addEventListener(GUIDE_CONTENT_EVENT, handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(GUIDE_CONTENT_EVENT, handleUpdate);
    };
  }, []);

  return {
    ...content,
    isLoading
  };
}
