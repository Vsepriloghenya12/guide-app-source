import { defaultGuideContent } from './mockData';
import { defaultCategories } from './categories';
import type { GuideCategory, GuideContentStore, GuidePlace } from '../types';

const GUIDE_CONTENT_KEY = 'guide-content-store-v3';
const LEGACY_GUIDE_CONTENT_KEY = 'guide-content-store-v2';

export const GUIDE_CONTENT_EVENT = 'guide-content-updated';

function cloneDefaultStore(): GuideContentStore {
  return JSON.parse(JSON.stringify(defaultGuideContent)) as GuideContentStore;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createMigratedPlace(item: {
  id: string;
  title: string;
  address: string;
  description: string;
  rating: number;
  imageLabel?: string;
  avgCheck?: number;
  kind?: string;
  cuisine?: string;
  breakfast?: boolean;
  vegan?: boolean;
  pets?: boolean;
  services?: string[];
  childPrograms?: boolean;
}): GuidePlace {
  return {
    id: item.id,
    categoryId: item.services ? 'wellness' : 'restaurants',
    title: item.title,
    description: item.description,
    address: item.address,
    phone: '',
    website: '',
    hours: '',
    avgCheck: item.avgCheck,
    kind: item.kind ?? '',
    cuisine: item.cuisine ?? '',
    services: item.services ?? [],
    tags: [],
    breakfast: item.breakfast ?? false,
    vegan: item.vegan ?? false,
    pets: item.pets ?? false,
    childPrograms: item.childPrograms ?? false,
    top: false,
    rating: item.rating,
    imageLabel: item.imageLabel ?? 'Карточка',
    imageSrc: '',
    imageGallery: []
  };
}

function migrateLegacyStore(raw: string): GuideContentStore | null {
  try {
    const legacy = JSON.parse(raw) as {
      restaurants?: Array<{
        id: string;
        title: string;
        address: string;
        description: string;
        rating: number;
        imageLabel?: string;
        avgCheck?: number;
        kind?: string;
        cuisine?: string;
        breakfast?: boolean;
        vegan?: boolean;
        pets?: boolean;
      }>;
      wellness?: Array<{
        id: string;
        title: string;
        address: string;
        description: string;
        rating: number;
        imageLabel?: string;
        services?: string[];
        childPrograms?: boolean;
      }>;
    };

    return {
      ...cloneDefaultStore(),
      places: [
        ...(legacy.restaurants ?? []).map((item) =>
          createMigratedPlace({
            ...item,
            kind: item.kind,
            cuisine: item.cuisine
          })
        ),
        ...(legacy.wellness ?? []).map((item) => createMigratedPlace(item))
      ]
    };
  } catch {
    return null;
  }
}

function normalizeCategory(category: GuideCategory, fallback: GuideCategory): GuideCategory {
  return {
    ...fallback,
    ...category,
    visible: category.visible ?? fallback.visible,
    showOnHome: category.showOnHome ?? fallback.showOnHome
  };
}

function normalizeStore(parsed: Partial<GuideContentStore>): GuideContentStore {
  const defaults = cloneDefaultStore();

  return {
    version: 2,
    places: Array.isArray(parsed.places)
      ? parsed.places.map((place) => ({
          ...place,
          imageGallery: Array.isArray(place.imageGallery)
            ? place.imageGallery.filter((image): image is string => Boolean(image))
            : place.imageSrc
              ? [place.imageSrc]
              : [],
          imageSrc: place.imageSrc ?? ''
        }))
      : defaults.places,
    categories: Array.isArray(parsed.categories)
      ? defaultCategories.map((fallback) => {
          const found = parsed.categories?.find((category) => category.id === fallback.id);
          return found ? normalizeCategory(found, fallback) : fallback;
        })
      : defaults.categories,
    tips: Array.isArray(parsed.tips) ? parsed.tips : defaults.tips,
    banners: Array.isArray(parsed.banners) ? parsed.banners : defaults.banners,
    collections: Array.isArray(parsed.collections) ? parsed.collections : defaults.collections,
    home: {
      popularPlaceIds: parsed.home?.popularPlaceIds ?? defaults.home.popularPlaceIds,
      featuredCategoryIds: parsed.home?.featuredCategoryIds ?? defaults.home.featuredCategoryIds,
      tipIds: parsed.home?.tipIds ?? defaults.home.tipIds,
      bannerIds: parsed.home?.bannerIds ?? defaults.home.bannerIds,
      collectionIds: parsed.home?.collectionIds ?? defaults.home.collectionIds,
      sectionTitles: {
        popular: parsed.home?.sectionTitles?.popular ?? defaults.home.sectionTitles.popular,
        categories: parsed.home?.sectionTitles?.categories ?? defaults.home.sectionTitles.categories,
        tips: parsed.home?.sectionTitles?.tips ?? defaults.home.sectionTitles.tips,
        collections:
          parsed.home?.sectionTitles?.collections ?? defaults.home.sectionTitles.collections,
        allCategories:
          parsed.home?.sectionTitles?.allCategories ?? defaults.home.sectionTitles.allCategories
      }
    }
  };
}

export function readGuideContent(): GuideContentStore {
  if (!canUseStorage()) {
    return cloneDefaultStore();
  }

  try {
    const raw = window.localStorage.getItem(GUIDE_CONTENT_KEY);

    if (raw) {
      return normalizeStore(JSON.parse(raw) as Partial<GuideContentStore>);
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_GUIDE_CONTENT_KEY);
    if (legacyRaw) {
      const migrated = migrateLegacyStore(legacyRaw);
      if (migrated) {
        writeGuideContent(migrated);
        return migrated;
      }
    }

    return cloneDefaultStore();
  } catch {
    return cloneDefaultStore();
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

export function updateGuideContent(updater: (current: GuideContentStore) => GuideContentStore) {
  const current = readGuideContent();
  writeGuideContent(updater(current));
}

export function resetGuideContent() {
  writeGuideContent(cloneDefaultStore());
}

export type { GuideContentStore } from '../types';
