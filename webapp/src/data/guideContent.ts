import { defaultGuideContent } from './mockData';
import { defaultCategories } from './categories';
import type { GuideCategory, GuideContentStore, GuidePlace } from '../types';
import { notifyOwnerAuthRequired } from '../utils/ownerEvents';

const GUIDE_CONTENT_KEY = 'guide-content-store-v4';
const LEGACY_GUIDE_CONTENT_KEY = 'guide-content-store-v2';
const GUIDE_CONTENT_PUBLIC_ENDPOINT = '/api/public/content';
const GUIDE_CONTENT_OWNER_ENDPOINT = '/api/owner/bootstrap';
const GUIDE_CONTENT_WRITE_ENDPOINT = '/api/content';
const GUIDE_CONTENT_RESET_ENDPOINT = '/api/content/reset';

export const GUIDE_CONTENT_EVENT = 'guide-content-updated';

let persistQueue: Promise<unknown> = Promise.resolve();
let serverSyncPromises: Partial<Record<GuideContentScope, Promise<GuideContentStore>>> = {};

export type GuideContentScope = 'public' | 'owner';

function cloneRawDefaultStore(): GuideContentStore {
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

    return normalizeStore({
      ...cloneRawDefaultStore(),
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
    });
  } catch {
    return null;
  }
}

function normalizeCategory(category: Partial<GuideCategory>, fallback: GuideCategory): GuideCategory {
  return {
    ...fallback,
    ...category,
    visible: category.visible ?? fallback.visible,
    showOnHome: category.showOnHome ?? fallback.showOnHome,
    slug: category.slug ?? fallback.slug ?? fallback.id,
    shortTitle: category.shortTitle ?? fallback.shortTitle ?? fallback.title,
    accent: category.accent ?? fallback.accent ?? 'coast',
    imageSrc: category.imageSrc ?? fallback.imageSrc ?? '',
    sortOrder: category.sortOrder ?? fallback.sortOrder ?? 100,
    filterSchema: {
      quickFilters: category.filterSchema?.quickFilters ?? fallback.filterSchema?.quickFilters ?? [],
      fields: category.filterSchema?.fields ?? fallback.filterSchema?.fields ?? []
    }
  };
}

function normalizePlace(place: GuidePlace): GuidePlace {
  const gallery = Array.isArray(place.imageGallery)
    ? place.imageGallery.filter((image): image is string => Boolean(image))
    : place.imageSrc
      ? [place.imageSrc]
      : [];

  const imageUrls = Array.isArray(place.imageUrls)
    ? place.imageUrls.filter((image): image is string => Boolean(image))
    : gallery;

  const categorySlug = place.categorySlug ?? place.categoryId;
  const slug = place.slug ?? `${categorySlug}-${place.id}`;
  const coverImageUrl = place.coverImageUrl ?? place.imageSrc ?? imageUrls[0] ?? '';

  return {
    ...place,
    imageGallery: gallery,
    imageSrc: place.imageSrc ?? '',
    hotelStars: typeof place.hotelStars === 'number' ? place.hotelStars : null,
    hotelPool: place.hotelPool ?? false,
    hotelSpa: place.hotelSpa ?? false,
    slug,
    categorySlug,
    featured: place.featured ?? place.top ?? false,
    shortDescription: place.shortDescription ?? place.description,
    priceLabel: place.priceLabel ?? (typeof place.avgCheck === 'number' ? `от ${place.avgCheck}` : ''),
    listingType: place.listingType ?? place.kind ?? '',
    childFriendly: place.childFriendly ?? place.childPrograms ?? false,
    petFriendly: place.petFriendly ?? place.pets ?? false,
    mapQuery: place.mapQuery ?? place.address ?? '',
    extra: Array.isArray(place.extra) ? place.extra : place.services ?? [],
    imageUrls,
    coverImageUrl,
    websiteUrl: place.websiteUrl ?? place.website ?? '',
    phoneNumber: place.phoneNumber ?? place.phone ?? '',
    district: place.district ?? '',
    location: place.location ?? place.address ?? '',
    type: place.type ?? place.kind ?? ''
  };
}

function normalizeStore(parsed: Partial<GuideContentStore>): GuideContentStore {
  const rawDefaults = cloneRawDefaultStore();
  const normalizedDefaultCategories = defaultCategories.map((fallback) => normalizeCategory(fallback, fallback));
  const normalizedDefaultPlaces = (Array.isArray(rawDefaults.places) ? rawDefaults.places : []).map(normalizePlace);

  const places = Array.isArray(parsed.places) ? parsed.places.map(normalizePlace) : normalizedDefaultPlaces;

  const categories = Array.isArray(parsed.categories)
    ? defaultCategories.map((fallback) => {
        const found = parsed.categories?.find((category) => category.id === fallback.id);
        return normalizeCategory(found ?? fallback, fallback);
      })
    : normalizedDefaultCategories;

  return {
    version: 4,
    places,
    restaurants: places.filter((place) => place.categoryId === 'restaurants'),
    wellness: places.filter((place) => place.categoryId === 'wellness'),
    categories,
    tips: Array.isArray(parsed.tips) ? parsed.tips : rawDefaults.tips,
    banners: Array.isArray(parsed.banners) ? parsed.banners : rawDefaults.banners,
    collections: Array.isArray(parsed.collections) ? parsed.collections : rawDefaults.collections,
    home: {
      popularPlaceIds: parsed.home?.popularPlaceIds ?? rawDefaults.home.popularPlaceIds,
      featuredCategoryIds: parsed.home?.featuredCategoryIds ?? rawDefaults.home.featuredCategoryIds,
      tipIds: parsed.home?.tipIds ?? rawDefaults.home.tipIds,
      bannerIds: parsed.home?.bannerIds ?? rawDefaults.home.bannerIds,
      collectionIds: parsed.home?.collectionIds ?? rawDefaults.home.collectionIds,
      logoMedia: parsed.home?.logoMedia?.src
        ? {
            type: parsed.home.logoMedia.type === 'video' ? 'video' : 'image',
            src: parsed.home.logoMedia.src,
            posterSrc: parsed.home.logoMedia.posterSrc || '',
            alt: parsed.home.logoMedia.alt || ''
          }
        : rawDefaults.home?.logoMedia?.src
          ? {
              type: rawDefaults.home.logoMedia.type === 'video' ? 'video' : 'image',
              src: rawDefaults.home.logoMedia.src,
              posterSrc: rawDefaults.home.logoMedia.posterSrc || '',
              alt: rawDefaults.home.logoMedia.alt || ''
            }
          : undefined,
      sectionTitles: {
        popular: parsed.home?.sectionTitles?.popular ?? rawDefaults.home.sectionTitles.popular,
        categories: parsed.home?.sectionTitles?.categories ?? rawDefaults.home.sectionTitles.categories,
        tips: parsed.home?.sectionTitles?.tips ?? rawDefaults.home.sectionTitles.tips,
        collections: parsed.home?.sectionTitles?.collections ?? rawDefaults.home.sectionTitles.collections,
        allCategories: parsed.home?.sectionTitles?.allCategories ?? rawDefaults.home.sectionTitles.allCategories
      }
    },
    analytics: {
      events: Array.isArray(parsed.analytics?.events)
        ? parsed.analytics.events.filter((event): event is NonNullable<typeof event> => Boolean(event)).slice(-400)
        : rawDefaults.analytics?.events ?? []
    }
  };
}

function cloneDefaultStore(): GuideContentStore {
  return normalizeStore(cloneRawDefaultStore());
}

function emitGuideContentUpdate() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(GUIDE_CONTENT_EVENT));
}

async function fetchContentFromServer(scope: GuideContentScope = 'public'): Promise<GuideContentStore> {
  const endpoint = scope === 'owner' ? GUIDE_CONTENT_OWNER_ENDPOINT : GUIDE_CONTENT_PUBLIC_ENDPOINT;
  const response = await fetch(endpoint, {
    credentials: 'include'
  });

  const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; content?: GuideContentStore; message?: string };

  if (!response.ok || !payload.content) {
    throw new Error(payload.message || 'Не удалось загрузить контент с сервера.');
  }

  return normalizeStore(payload.content);
}

async function pushContentToServer(store: GuideContentStore) {
  const response = await fetch(GUIDE_CONTENT_WRITE_ENDPOINT, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: store })
  });

  const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; content?: GuideContentStore; message?: string };

  if (!response.ok || !payload.content) {
    if (response.status === 401) {
      notifyOwnerAuthRequired();
    }
    throw new Error(payload.message || 'Не удалось сохранить контент в PostgreSQL.');
  }

  return normalizeStore(payload.content);
}

function queuePersist(store: GuideContentStore) {
  persistQueue = persistQueue
    .catch(() => undefined)
    .then(async () => {
      const remoteStore = await pushContentToServer(store);
      writeGuideContent(remoteStore, { persist: false, emit: true });
      return remoteStore;
    });

  return persistQueue;
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
        writeGuideContent(migrated, { persist: false, emit: true });
        return migrated;
      }
    }

    return cloneDefaultStore();
  } catch {
    return cloneDefaultStore();
  }
}

export function writeGuideContent(
  store: GuideContentStore,
  options: {
    persist?: boolean;
    emit?: boolean;
  } = {}
) {
  const nextStore = normalizeStore(store);

  if (canUseStorage()) {
    window.localStorage.setItem(GUIDE_CONTENT_KEY, JSON.stringify(nextStore));
  }

  if (options.emit !== false) {
    emitGuideContentUpdate();
  }

  if (options.persist) {
    void queuePersist(nextStore);
  }

  return nextStore;
}

export function updateGuideContent(
  updater: (current: GuideContentStore) => GuideContentStore,
  options: {
    persist?: boolean;
  } = {}
) {
  const current = readGuideContent();
  return writeGuideContent(updater(current), {
    persist: options.persist ?? true,
    emit: true
  });
}

export async function syncGuideContentFromServer(scope: GuideContentScope = 'public') {
  if (typeof window === 'undefined') {
    return cloneDefaultStore();
  }

  if (!serverSyncPromises[scope]) {
    serverSyncPromises[scope] = fetchContentFromServer(scope)
      .then((remoteStore) => writeGuideContent(remoteStore, { persist: false, emit: true }))
      .catch(() => readGuideContent())
      .finally(() => {
        delete serverSyncPromises[scope];
      }) as Promise<GuideContentStore>;
  }

  return serverSyncPromises[scope] as Promise<GuideContentStore>;
}

export async function resetGuideContent() {
  const localReset = writeGuideContent(cloneDefaultStore(), { persist: false, emit: true });

  try {
    const response = await fetch(GUIDE_CONTENT_RESET_ENDPOINT, {
      method: 'POST',
      credentials: 'include'
    });
    const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; content?: GuideContentStore };

    if (response.ok && payload.content) {
      return writeGuideContent(payload.content, { persist: false, emit: true });
    }
  } catch {
    // ignore network errors and keep local reset state
  }

  return localReset;
}

export type { GuideContentStore } from '../types';
