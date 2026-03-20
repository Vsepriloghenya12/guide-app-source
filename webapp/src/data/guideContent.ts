import {
  restaurants as defaultRestaurants,
  wellnessItems as defaultWellnessItems,
  homeContent as defaultHomeContent
} from './mockData';
import {
  fetchGuideContent,
  resetGuideContentRequest,
  saveHomeContentRequest,
  saveRestaurantsRequest,
  saveWellnessRequest
} from './api';
import type { HomeContent, RestaurantItem, WellnessItem } from '../types';

export type GuideContentStore = {
  restaurants: RestaurantItem[];
  wellness: WellnessItem[];
  home: HomeContent;
};

export const GUIDE_CONTENT_EVENT = 'guide-content-updated';

function emitGuideContentUpdate() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(GUIDE_CONTENT_EVENT));
}

export function getDefaultGuideContent(): GuideContentStore {
  return {
    restaurants: defaultRestaurants,
    wellness: defaultWellnessItems,
    home: defaultHomeContent
  };
}

export async function readGuideContent(): Promise<GuideContentStore> {
  try {
    return await fetchGuideContent();
  } catch (error) {
    console.error('readGuideContent fallback to defaults', error);
    return getDefaultGuideContent();
  }
}

export async function saveRestaurants(restaurants: RestaurantItem[]) {
  const store = await saveRestaurantsRequest(restaurants);
  emitGuideContentUpdate();
  return store;
}

export async function saveWellnessItems(wellness: WellnessItem[]) {
  const store = await saveWellnessRequest(wellness);
  emitGuideContentUpdate();
  return store;
}

export async function saveHomeContent(home: HomeContent) {
  const store = await saveHomeContentRequest(home);
  emitGuideContentUpdate();
  return store;
}

export async function resetGuideContent() {
  const store = await resetGuideContentRequest();
  emitGuideContentUpdate();
  return store;
}
