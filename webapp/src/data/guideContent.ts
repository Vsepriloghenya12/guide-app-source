import { restaurants as defaultRestaurants, wellnessItems as defaultWellnessItems } from './mockData';
import { fetchGuideContent, resetGuideContentRequest, saveRestaurantsRequest, saveWellnessRequest } from './api';
import type { RestaurantItem, WellnessItem } from '../types';

export type GuideContentStore = {
  restaurants: RestaurantItem[];
  wellness: WellnessItem[];
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
    wellness: defaultWellnessItems
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

export async function resetGuideContent() {
  const store = await resetGuideContentRequest();
  emitGuideContentUpdate();
  return store;
}
