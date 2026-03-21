const crypto = require('crypto');
const express = require('express');
const path = require('path');
const {
  appendAnalyticsEvent,
  ensureDatabase,
  getContentStore,
  hasDatabase,
  resetContentStore,
  saveContentStore
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
    listings: store.places,
    banners: store.banners,
    collections: store.collections,
    tips: store.tips,
    home: store.home
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
    const store = await getContentStore();
    res.json({ ok: true, categories: store.categories });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load categories' });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const store = await getContentStore();
    const category = store.categories.find((item) => item.slug === req.params.slug || item.id === req.params.slug);

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
    const store = await getContentStore();
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const search = typeof req.query.search === 'string' ? req.query.search : '';

    const listings = store.places.filter((listing) => {
      if (category && listing.categoryId !== category && listing.categorySlug !== category) {
        return false;
      }
      return matchesListing(listing, search);
    });

    res.json({ ok: true, listings });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load listings' });
  }
});

app.get('/api/listings/:slug', async (req, res) => {
  try {
    const store = await getContentStore();
    const listing = store.places.find((item) => item.slug === req.params.slug || item.id === req.params.slug);

    if (!listing) {
      res.status(404).json({ ok: false, message: 'Listing not found' });
      return;
    }

    const category = store.categories.find((item) => item.id === listing.categoryId);
    const similar = store.places.filter((item) => item.categoryId === listing.categoryId && item.id !== listing.id).slice(0, 6);

    res.json({ ok: true, listing, category, similar });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to load listing' });
  }
});


app.post('/api/owner/listings', requireOwner, async (req, res) => {
  try {
    const incoming = req.body ?? {};
    const store = await getContentStore();
    const categoryId = incoming.categoryId || incoming.categorySlug || 'restaurants';
    const nextListing = {
      ...incoming,
      id: incoming.id || `place-${Date.now()}`,
      categoryId,
      categorySlug: incoming.categorySlug || categoryId,
      imageGallery: Array.isArray(incoming.imageGallery)
        ? incoming.imageGallery
        : Array.isArray(incoming.imageUrls)
          ? incoming.imageUrls
          : incoming.coverImageUrl
            ? [incoming.coverImageUrl]
            : incoming.imageSrc
              ? [incoming.imageSrc]
              : [],
      imageSrc: incoming.imageSrc || incoming.coverImageUrl || incoming.imageUrls?.[0] || '',
      services: Array.isArray(incoming.services) ? incoming.services : [],
      tags: Array.isArray(incoming.tags) ? incoming.tags : [],
      breakfast: Boolean(incoming.breakfast),
      vegan: Boolean(incoming.vegan),
      pets: Boolean(incoming.pets || incoming.petFriendly),
      childPrograms: Boolean(incoming.childPrograms || incoming.childFriendly),
      top: Boolean(incoming.top || incoming.featured),
      rating: Number(incoming.rating || 0),
      title: String(incoming.title || '').trim(),
      description: String(incoming.description || incoming.shortDescription || '').trim(),
      address: String(incoming.address || incoming.location || '').trim(),
      phone: String(incoming.phone || incoming.phoneNumber || '').trim(),
      website: String(incoming.website || incoming.websiteUrl || '').trim(),
      hours: String(incoming.hours || '').trim(),
      kind: String(incoming.kind || incoming.listingType || incoming.type || '').trim(),
      cuisine: String(incoming.cuisine || '').trim(),
      imageLabel: String(incoming.imageLabel || incoming.title || 'Карточка места').trim()
    };

    const nextStore = await saveContentStore({
      ...store,
      places: [nextListing, ...store.places.filter((item) => item.id !== nextListing.id)]
    });
    const savedListing = nextStore.places.find((item) => item.id === nextListing.id);
    res.json({ ok: true, listing: savedListing });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to save listing' });
  }
});

app.put('/api/owner/listings/:id', requireOwner, async (req, res) => {
  try {
    const incoming = req.body ?? {};
    const store = await getContentStore();
    const currentListing = store.places.find((item) => item.id === req.params.id);

    if (!currentListing) {
      res.status(404).json({ ok: false, message: 'Listing not found' });
      return;
    }

    const categoryId = incoming.categoryId || incoming.categorySlug || currentListing.categoryId;
    const nextListing = {
      ...currentListing,
      ...incoming,
      id: req.params.id,
      categoryId,
      categorySlug: incoming.categorySlug || categoryId,
      imageGallery: Array.isArray(incoming.imageGallery)
        ? incoming.imageGallery
        : Array.isArray(incoming.imageUrls)
          ? incoming.imageUrls
          : currentListing.imageGallery || [],
      imageSrc:
        incoming.imageSrc || incoming.coverImageUrl || incoming.imageUrls?.[0] || currentListing.imageSrc || '',
      services: Array.isArray(incoming.services) ? incoming.services : currentListing.services,
      tags: Array.isArray(incoming.tags) ? incoming.tags : currentListing.tags,
      breakfast: incoming.breakfast ?? currentListing.breakfast,
      vegan: incoming.vegan ?? currentListing.vegan,
      pets: incoming.pets ?? incoming.petFriendly ?? currentListing.pets,
      childPrograms: incoming.childPrograms ?? incoming.childFriendly ?? currentListing.childPrograms,
      top: incoming.top ?? incoming.featured ?? currentListing.top,
      rating: Number(incoming.rating ?? currentListing.rating ?? 0),
      title: String(incoming.title ?? currentListing.title).trim(),
      description: String(incoming.description ?? incoming.shortDescription ?? currentListing.description).trim(),
      address: String(incoming.address ?? incoming.location ?? currentListing.address).trim(),
      phone: String(incoming.phone ?? incoming.phoneNumber ?? currentListing.phone).trim(),
      website: String(incoming.website ?? incoming.websiteUrl ?? currentListing.website).trim(),
      hours: String(incoming.hours ?? currentListing.hours).trim(),
      kind: String(incoming.kind ?? incoming.listingType ?? incoming.type ?? currentListing.kind).trim(),
      cuisine: String(incoming.cuisine ?? currentListing.cuisine).trim(),
      imageLabel: String(incoming.imageLabel ?? currentListing.imageLabel).trim()
    };

    const nextStore = await saveContentStore({
      ...store,
      places: store.places.map((item) => (item.id === req.params.id ? nextListing : item))
    });
    const savedListing = nextStore.places.find((item) => item.id === req.params.id);
    res.json({ ok: true, listing: savedListing });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to update listing' });
  }
});

app.delete('/api/owner/listings/:id', requireOwner, async (req, res) => {
  try {
    const store = await getContentStore();
    await saveContentStore({
      ...store,
      places: store.places.filter((item) => item.id !== req.params.id),
      home: {
        ...store.home,
        popularPlaceIds: store.home.popularPlaceIds.filter((itemId) => itemId !== req.params.id)
      },
      collections: store.collections.map((collection) => ({
        ...collection,
        itemIds: collection.itemIds.filter((itemId) => itemId !== req.params.id)
      }))
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to delete listing' });
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

app.post('/api/owner/upload', requireOwner, (_req, res) => {
  res.status(501).json({ ok: false, message: 'Image upload endpoint is not enabled in this build. Use client-side image upload in Owner CMS.' });
});

app.get('/api/search', async (req, res) => {
  try {
    const store = await getContentStore();
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const listings = store.places.filter((listing) => matchesListing(listing, query));
    res.json({ ok: true, listings });
  } catch (error) {
    res.status(500).json({ ok: false, message: error instanceof Error ? error.message : 'Failed to search listings' });
  }
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
