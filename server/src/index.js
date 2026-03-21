const crypto = require('crypto');
const express = require('express');
const path = require('path');
const {
  appendAnalyticsEvent,
  deletePlace,
  ensureDatabase,
  getCategories,
  getContentStore,
  getPlaceById,
  getPlaceBySlug,
  getPlaces,
  hasDatabase,
  normalizePlace,
  resetContentStore,
  saveContentStore,
  upsertPlace
} = require('./db');

const app = express();
const PORT = process.env.PORT || 8080;
const webDistPath = path.resolve(__dirname, '../../webapp/dist');
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'guide2026';
const OWNER_SESSION_SECRET = process.env.OWNER_SESSION_SECRET || 'guide-owner-secret-change-me';
const OWNER_COOKIE_NAME = 'guide_owner_session';
const OWNER_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((accumulator, chunk) => {
      const separatorIndex = chunk.indexOf('=');
      if (separatorIndex === -1) {
        return accumulator;
      }
      const key = chunk.slice(0, separatorIndex).trim();
      const value = chunk.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function createOwnerSessionValue() {
  const issuedAt = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', OWNER_SESSION_SECRET)
    .update(issuedAt)
    .digest('hex');

  return `${issuedAt}.${signature}`;
}

function isValidOwnerSession(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') {
    return false;
  }

  const [issuedAt, signature] = rawValue.split('.');
  if (!issuedAt || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', OWNER_SESSION_SECRET)
    .update(issuedAt)
    .digest('hex');

  const sameLength = signature.length === expectedSignature.length;
  const validSignature = sameLength
    ? crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    : false;

  if (!validSignature) {
    return false;
  }

  const ageMs = Date.now() - Number(issuedAt);
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= OWNER_SESSION_TTL_SECONDS * 1000;
}

function setOwnerSessionCookie(res) {
  const cookieParts = [
    `${OWNER_COOKIE_NAME}=${encodeURIComponent(createOwnerSessionValue())}`,
    'Path=/',
    `Max-Age=${OWNER_SESSION_TTL_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax'
  ];

  if (process.env.NODE_ENV === 'production') {
    cookieParts.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

function clearOwnerSessionCookie(res) {
  const cookieParts = [
    `${OWNER_COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax'
  ];

  if (process.env.NODE_ENV === 'production') {
    cookieParts.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieParts.join('; '));
}

function isOwnerAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return isValidOwnerSession(cookies[OWNER_COOKIE_NAME]);
}

function requireOwner(req, res, next) {
  if (!isOwnerAuthenticated(req)) {
    res.status(401).json({ ok: false, message: 'Owner auth required' });
    return;
  }

  next();
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : [];
}

function toListing(place) {
  const imageGallery = Array.isArray(place.imageGallery)
    ? place.imageGallery.filter((image) => typeof image === 'string' && image)
    : place.imageSrc
      ? [place.imageSrc]
      : [];

  const imageUrls = Array.isArray(place.imageUrls)
    ? place.imageUrls.filter((image) => typeof image === 'string' && image)
    : imageGallery;

  const categorySlug = place.categorySlug || place.categoryId;
  const slug = place.slug || `${categorySlug}-${place.id}`;
  const coverImageUrl = place.coverImageUrl || place.imageSrc || imageUrls[0] || '';
  const status = place.status || 'published';

  return {
    ...place,
    slug,
    categorySlug,
    featured: Boolean(place.featured ?? place.top),
    shortDescription: place.shortDescription || place.description,
    priceLabel: place.priceLabel || (typeof place.avgCheck === 'number' ? `от ${place.avgCheck}` : ''),
    listingType: place.listingType || place.kind || '',
    childFriendly: Boolean(place.childFriendly ?? place.childPrograms),
    petFriendly: Boolean(place.petFriendly ?? place.pets),
    mapQuery: place.mapQuery || place.address || '',
    extra: Array.isArray(place.extra) ? place.extra : normalizeStringArray(place.services),
    imageGallery,
    imageUrls,
    coverImageUrl,
    websiteUrl: place.websiteUrl || place.website || '',
    phoneNumber: place.phoneNumber || place.phone || '',
    district: place.district || '',
    location: place.location || place.address || '',
    type: place.type || place.kind || '',
    status,
    sortOrder: Number(place.sortOrder || 0) || 0,
    lat: typeof place.lat === 'number' ? place.lat : null,
    lng: typeof place.lng === 'number' ? place.lng : null,
    visible: place.visible ?? status !== 'hidden'
  };
}

function matchesListing(listing, searchText) {
  if (!searchText) {
    return true;
  }

  const haystack = [
    listing.title,
    listing.description,
    listing.address,
    listing.kind,
    listing.cuisine,
    ...(listing.tags || []),
    ...(listing.services || [])
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(searchText.toLowerCase());
}

function toBootstrapPayload(store) {
  return {
    categories: store.categories,
    listings: store.places.map(toListing),
    banners: store.banners,
    collections: store.collections,
    tips: store.tips,
    home: store.home
  };
}

function mergeCategoryPlaces(store, categoryId, incomingPlaces) {
  const normalizedIncoming = Array.isArray(incomingPlaces) ? incomingPlaces.map((item, index) => normalizePlace({ ...item, categoryId }, index)) : [];
  return {
    ...store,
    places: [...store.places.filter((place) => place.categoryId !== categoryId), ...normalizedIncoming]
  };
}

function normalizeIncomingListing(incoming, currentListing = null) {
  return normalizePlace(
    {
      ...currentListing,
      ...incoming,
      categoryId: incoming.categoryId || incoming.categorySlug || currentListing?.categoryId || 'restaurants',
      categorySlug: incoming.categorySlug || incoming.categoryId || currentListing?.categoryId || 'restaurants'
    },
    0,
    currentListing || undefined
  );
}

async function getOwnerSummaryPayload() {
  const store = await getContentStore();
  const pageViews = store.analytics?.events?.filter((event) => event.kind === 'page-view').length || 0;
  const clicks = store.analytics?.events?.filter((event) => event.kind !== 'page-view').length || 0;

  return {
    sections: store.categories.length,
    listingsReady: store.places.length,
    pwaEnabled: true,
    places: store.places.length,
    categories: store.categories.length,
    tips: store.tips.length,
    banners: store.banners.length,
    collections: store.collections.length,
    topPlaces: store.places.filter((place) => place.top).length,
    pageViews,
    clicks,
    storage: hasDatabase() ? 'postgresql' : 'memory'
  };
}

app.get('/api/health', async (_req, res) => {
  try {
    if (hasDatabase()) {
      await ensureDatabase();
    }

    res.json({
      ok: true,
      service: 'guide-app-server',
      database: hasDatabase() ? 'postgres' : 'disabled'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      service: 'guide-app-server',
      database: 'error',
      message: error instanceof Error ? error.message : 'Database init failed'
    });
  }
});

app.get('/api/content', async (_req, res) => {
  try {
    const store = await getContentStore();
    res.json({ ok: true, content: store });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load content' });
  }
});

app.put('/api/content', requireOwner, async (req, res) => {
  try {
    const store = await saveContentStore(req.body?.content ?? req.body ?? {});
    res.json({ ok: true, content: store });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save content' });
  }
});

app.put('/api/content/restaurants', requireOwner, async (req, res) => {
  try {
    const store = await getContentStore();
    const nextStore = await saveContentStore(mergeCategoryPlaces(store, 'restaurants', req.body?.restaurants));
    res.json({ ok: true, content: nextStore });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save restaurants' });
  }
});

app.put('/api/content/wellness', requireOwner, async (req, res) => {
  try {
    const store = await getContentStore();
    const nextStore = await saveContentStore(mergeCategoryPlaces(store, 'wellness', req.body?.wellness));
    res.json({ ok: true, content: nextStore });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save wellness' });
  }
});

app.put('/api/content/home', requireOwner, async (req, res) => {
  try {
    const store = await getContentStore();
    const nextStore = await saveContentStore({
      ...store,
      home: req.body?.home && typeof req.body.home === 'object' ? req.body.home : store.home
    });
    res.json({ ok: true, content: nextStore });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save home content' });
  }
});

app.post('/api/content/reset', requireOwner, async (_req, res) => {
  try {
    const store = await resetContentStore();
    res.json({ ok: true, content: store });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to reset content' });
  }
});

app.post('/api/analytics', async (req, res) => {
  try {
    const event = req.body ?? {};
    if (!event.id || !event.kind || !event.label || !event.path || !event.createdAt) {
      res.status(400).json({ ok: false, message: 'Analytics event is incomplete' });
      return;
    }

    await appendAnalyticsEvent(event);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save analytics' });
  }
});

app.get('/api/owner/session', (req, res) => {
  res.json({ ok: true, authenticated: isOwnerAuthenticated(req) });
});

app.post('/api/owner/login', (req, res) => {
  const password = String(req.body?.password || '');

  if (password !== OWNER_PASSWORD) {
    res.status(401).json({ ok: false, authenticated: false, message: 'Invalid password' });
    return;
  }

  setOwnerSessionCookie(res);
  res.json({ ok: true, authenticated: true });
});

app.post('/api/owner/logout', (_req, res) => {
  clearOwnerSessionCookie(res);
  res.json({ ok: true });
});

app.get('/api/owner/bootstrap', requireOwner, async (_req, res) => {
  try {
    const store = await getContentStore();
    res.json({ ok: true, content: store, ...toBootstrapPayload(store) });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load owner bootstrap' });
  }
});

app.get('/api/owner/summary', requireOwner, async (_req, res) => {
  try {
    const summary = await getOwnerSummaryPayload();
    res.json({ ok: true, ...summary });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load owner summary' });
  }
});

app.get('/api/bootstrap', async (_req, res) => {
  try {
    const store = await getContentStore();
    res.json({ ok: true, ...toBootstrapPayload(store) });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load bootstrap' });
  }
});

app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await getCategories();
    res.json({ ok: true, categories });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load categories' });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const categories = await getCategories();
    const category = categories.find((item) => item.slug === req.params.slug || item.id === req.params.slug);

    if (!category) {
      res.status(404).json({ ok: false, message: 'Category not found' });
      return;
    }

    res.json({ ok: true, category, filters: [{ config: category.filterSchema }] });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load category' });
  }
});

app.get('/api/listings', async (req, res) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const includeHidden = req.query.status === '' || req.query.includeHidden === 'true';

    const listings = (await getPlaces({ categoryId: category, search, includeHidden }))
      .map(toListing)
      .filter((listing) => matchesListing(listing, search));

    res.json({ ok: true, listings });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load listings' });
  }
});

app.get('/api/listings/:slug', async (req, res) => {
  try {
    const listing = await getPlaceBySlug(req.params.slug);

    if (!listing) {
      res.status(404).json({ ok: false, message: 'Listing not found' });
      return;
    }

    const categories = await getCategories();
    const similar = (await getPlaces({ categoryId: listing.categoryId, includeHidden: true }))
      .filter((item) => item.id !== listing.id)
      .slice(0, 6)
      .map(toListing);

    const category = categories.find((item) => item.id === listing.categoryId) || null;

    res.json({ ok: true, listing: toListing(listing), category, similar });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load listing' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const listings = (await getPlaces({ includeHidden: true, search: query })).map(toListing);
    res.json({ ok: true, listings });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to search listings' });
  }
});

app.get('/api/owner/categories', requireOwner, async (_req, res) => {
  try {
    const categories = await getCategories();
    res.json({ ok: true, categories });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load owner categories' });
  }
});

app.get('/api/owner/places', requireOwner, async (req, res) => {
  try {
    const categoryId = typeof req.query.category === 'string' ? req.query.category : '';
    const places = (await getPlaces({ categoryId, includeHidden: true })).map(toListing);
    res.json({ ok: true, places });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load owner places' });
  }
});

app.post('/api/owner/listings', requireOwner, async (req, res) => {
  try {
    const nextListing = normalizeIncomingListing(req.body ?? {});
    const savedListing = await upsertPlace(nextListing);
    res.json({ ok: true, listing: toListing(savedListing) });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save listing' });
  }
});

app.put('/api/owner/listings/:id', requireOwner, async (req, res) => {
  try {
    const currentListing = await getPlaceById(req.params.id);

    if (!currentListing) {
      res.status(404).json({ ok: false, message: 'Listing not found' });
      return;
    }

    const nextListing = normalizeIncomingListing(req.body ?? {}, currentListing);
    const savedListing = await upsertPlace(nextListing);
    res.json({ ok: true, listing: toListing(savedListing) });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to update listing' });
  }
});

app.post('/api/owner/places', requireOwner, async (req, res) => {
  try {
    const savedListing = await upsertPlace(normalizeIncomingListing(req.body ?? {}));
    res.json({ ok: true, place: toListing(savedListing) });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to create place' });
  }
});

app.put('/api/owner/places/:id', requireOwner, async (req, res) => {
  try {
    const currentListing = await getPlaceById(req.params.id);
    if (!currentListing) {
      res.status(404).json({ ok: false, message: 'Place not found' });
      return;
    }

    const savedListing = await upsertPlace(normalizeIncomingListing(req.body ?? {}, currentListing));
    res.json({ ok: true, place: toListing(savedListing) });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to update place' });
  }
});

app.delete('/api/owner/listings/:id', requireOwner, async (req, res) => {
  try {
    await deletePlace(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to delete listing' });
  }
});

app.delete('/api/owner/places/:id', requireOwner, async (req, res) => {
  try {
    await deletePlace(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to delete place' });
  }
});

app.put('/api/owner/collections/:slug/items', requireOwner, async (req, res) => {
  try {
    const store = await getContentStore();
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const nextStore = await saveContentStore({
      ...store,
      collections: store.collections.map((collection) =>
        collection.id === req.params.slug || collection.linkPath === req.params.slug
          ? { ...collection, itemIds: items.filter((item) => typeof item === 'string') }
          : collection
      )
    });
    res.json({ ok: true, collections: nextStore.collections });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save collection items' });
  }
});

app.put('/api/owner/banners', requireOwner, async (req, res) => {
  try {
    const store = await getContentStore();
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const nextStore = await saveContentStore({
      ...store,
      banners: items
    });
    res.json({ ok: true, banners: nextStore.banners });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save banners' });
  }
});

app.put('/api/owner/tips', requireOwner, async (req, res) => {
  try {
    const store = await getContentStore();
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const nextStore = await saveContentStore({
      ...store,
      tips: items
    });
    res.json({ ok: true, tips: nextStore.tips });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save tips' });
  }
});

app.put('/api/owner/home', requireOwner, async (req, res) => {
  try {
    const store = await getContentStore();
    const nextStore = await saveContentStore({
      ...store,
      home: req.body?.home && typeof req.body.home === 'object' ? req.body.home : store.home
    });
    res.json({ ok: true, home: nextStore.home });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save home' });
  }
});

app.post('/api/owner/upload', requireOwner, (_req, res) => {
  res.status(501).json({ ok: false, message: 'Image upload endpoint is not enabled in this build. Use client-side image upload in Owner CMS.' });
});

app.use(express.static(webDistPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

app.listen(PORT, async () => {
  try {
    if (hasDatabase()) {
      await ensureDatabase();
      console.log('Guide app server started on port %s with PostgreSQL', PORT);
      return;
    }

    console.log('Guide app server started on port %s without PostgreSQL', PORT);
  } catch (error) {
    console.error('Database init failed:', error);
  }
});
