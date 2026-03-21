import defaultGuideContentJson from '../../../shared/default-guide-content.json';
import type { GuideContentStore } from '../types';

export const defaultGuideContent: GuideContentStore = {
  ...(defaultGuideContentJson as GuideContentStore),
  version: 4,
  analytics: {
    events: Array.isArray((defaultGuideContentJson as GuideContentStore).analytics?.events)
      ? (defaultGuideContentJson as GuideContentStore).analytics.events
      : []
  }
};
