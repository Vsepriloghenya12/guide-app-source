import { restaurants as defaultRestaurants, wellnessItems as defaultWellnessItems } from './mockData';
import type { RestaurantItem, WellnessItem } from '../types';

export type GuideContentStore = {
  restaurants: RestaurantItem[];
  wellness: WellnessItem[];
};

const GUIDE_CONTENT_KEY = 'guide-content-store-v1';
export const GUIDE_CONTENT_EVENT = 'guide-content-updated';

function getDefaultStore(): GuideContentStore {
  return {
    restaurants: defaultRestaurants,
    wellness: defaultWellnessItems
  };
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readGuideContent(): GuideContentStore {
  if (!canUseStorage()) {
    return getDefaultStore();
  }

  try {
    const raw = window.localStorage.getItem(GUIDE_CONTENT_KEY);

    if (!raw) {
      return getDefaultStore();
    }

    const parsed = JSON.parse(raw) as Partial<GuideContentStore>;

    return {
      restaurants: Array.isArray(parsed.restaurants) ? parsed.restaurants : defaultRestaurants,
      wellness: Array.isArray(parsed.wellness) ? parsed.wellness : defaultWellnessItems
    };
  } catch {
    return getDefaultStore();
  }
}

function emitGuideContentUpdate() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(GUIDE_CONTENT_EVENT));
}

export function writeGuideContent(store: GuideContentStore) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(GUIDE_CONTENT_KEY, JSON.stringify(store));
  emitGuideContentUpdate();
}

export function saveRestaurants(restaurants: RestaurantItem[]) {
  const current = readGuideContent();
  writeGuideContent({
    ...current,
    restaurants
  });
}

export function saveWellnessItems(wellness: WellnessItem[]) {
  const current = readGuideContent();
  writeGuideContent({
    ...current,
    wellness
  });
}

export function resetGuideContent() {
  writeGuideContent(getDefaultStore());
}
