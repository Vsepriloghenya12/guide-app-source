import { updateGuideContent } from '../data/guideContent';
import type { GuideAnalyticsEvent, GuideAnalyticsKind, GuideCategoryId } from '../types';

type AnalyticsInput = {
  kind: GuideAnalyticsKind;
  label: string;
  path: string;
  entityId?: string;
  categoryId?: GuideCategoryId;
};

function createAnalyticsId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `analytics-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function recordGuideAnalytics(input: AnalyticsInput) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextEvent: GuideAnalyticsEvent = {
    id: createAnalyticsId(),
    kind: input.kind,
    label: input.label,
    path: input.path,
    entityId: input.entityId,
    categoryId: input.categoryId,
    createdAt: new Date().toISOString()
  };

  updateGuideContent((current) => ({
    ...current,
    analytics: {
      events: [...current.analytics.events, nextEvent].slice(-400)
    }
  }));
}

export function resetGuideAnalytics() {
  updateGuideContent((current) => ({
    ...current,
    analytics: {
      events: []
    }
  }));
}

export function getAnalyticsLabelByPath(pathname: string) {
  if (pathname === '/') return 'Главная';
  if (pathname === '/restaurants') return 'Рестораны';
  if (pathname === '/wellness') return 'СПА и оздоровление';
  if (pathname === '/search') return 'Поиск';
  if (pathname === '/favorites') return 'Избранное';
  if (pathname === '/nearby') return 'Рядом';
  if (pathname === '/help') return 'Помощь';
  if (pathname === '/contacts') return 'Контакты';
  if (pathname.startsWith('/section/')) return `Раздел ${pathname.replace('/section/', '')}`;
  return pathname;
}
