const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');
const sharp = require('sharp');
const { randomUUID } = require('crypto');
const { store, hasDatabase, getUploadsDir } = require('./store');

const app = express();
const PORT = process.env.PORT || 8080;
const webDistPath = path.resolve(__dirname, '../../webapp/dist');
const uploadDir = getUploadsDir();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'guide-app-session-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

if (hasDatabase) {
  const connectPgSimple = require('connect-pg-simple');
  const pgSession = connectPgSimple(session);
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
  });
  sessionOptions.store = new pgSession({ pool, createTableIfMissing: true, tableName: 'owner_sessions' });
}

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionOptions));
app.use('/uploads', express.static(uploadDir));
app.use(express.static(webDistPath));

function resolveOwnerPassword() {
  return process.env.OWNER_PASSWORD || 'guide2026';
}

async function validateOwnerPassword(password) {
  const hash = process.env.OWNER_PASSWORD_HASH;
  if (hash) {
    return bcrypt.compare(password, hash);
  }
  return password === resolveOwnerPassword();
}

function requireOwner(req, res, next) {
  if (req.session?.ownerAuthenticated) {
    return next();
  }
  res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
}

function sanitizeListingPayload(body) {
  const arrayField = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : value.split(',').map((item) => item.trim()).filter(Boolean);
      } catch {
        return value.split(',').map((item) => item.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const parseExtra = (value) => {
    if (!value) return {};
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  };

  return {
    id: body.id || undefined,
    slug: body.slug || undefined,
    categorySlug: body.categorySlug,
    title: body.title,
    shortDescription: body.shortDescription || '',
    description: body.description || '',
    address: body.address || '',
    phone: body.phone || '',
    website: body.website || '',
    hours: body.hours || '',
    mapQuery: body.mapQuery || body.address || body.title,
    averagePrice: body.averagePrice ? Number(body.averagePrice) : null,
    priceLabel: body.priceLabel || '',
    rating: body.rating ? Number(body.rating) : 0,
    listingType: body.listingType || '',
    cuisine: body.cuisine || '',
    services: arrayField(body.services),
    tags: arrayField(body.tags),
    features: arrayField(body.features),
    childFriendly: body.childFriendly === true || body.childFriendly === 'true',
    petFriendly: body.petFriendly === true || body.petFriendly === 'true',
    status: body.status || 'draft',
    sortOrder: body.sortOrder ? Number(body.sortOrder) : 100,
    featured: body.featured === true || body.featured === 'true',
    imageUrls: arrayField(body.imageUrls),
    extra: parseExtra(body.extra)
  };
}

app.get('/api/health', async (_req, res) => {
  const db = await store.health();
  res.json({ ok: true, service: 'guide-app-server', db });
});

app.get('/api/bootstrap', async (_req, res, next) => {
  try {
    const [categories, collections, banners] = await Promise.all([
      store.listCategories(),
      store.listCollections(),
      store.listBanners()
    ]);
    res.json({ ok: true, categories, collections, banners });
  } catch (error) {
    next(error);
  }
});

app.get('/api/categories', async (_req, res, next) => {
  try {
    const categories = await store.listCategories();
    res.json({ ok: true, categories });
  } catch (error) {
    next(error);
  }
});

app.get('/api/categories/:slug', async (req, res, next) => {
  try {
    const [category, filters] = await Promise.all([
      store.getCategoryBySlug(req.params.slug),
      store.listFiltersByCategory(req.params.slug)
    ]);
    if (!category) {
      res.status(404).json({ ok: false, error: 'CATEGORY_NOT_FOUND' });
      return;
    }
    res.json({ ok: true, category, filters });
  } catch (error) {
    next(error);
  }
});

app.get('/api/listings', async (req, res, next) => {
  try {
    const listings = await store.listListings({
      categorySlug: req.query.category ? String(req.query.category) : undefined,
      status: req.query.status ? String(req.query.status) : 'published',
      search: req.query.search ? String(req.query.search) : ''
    });
    res.json({ ok: true, listings });
  } catch (error) {
    next(error);
  }
});

app.get('/api/listings/:slug', async (req, res, next) => {
  try {
    const listing = await store.getListingBySlug(req.params.slug);
    if (!listing || listing.status !== 'published') {
      res.status(404).json({ ok: false, error: 'LISTING_NOT_FOUND' });
      return;
    }
    const [category, similar] = await Promise.all([
      store.getCategoryBySlug(listing.categorySlug),
      store.getSimilarListings(listing)
    ]);
    res.json({ ok: true, listing, category, similar });
  } catch (error) {
    next(error);
  }
});

app.get('/api/search', async (req, res, next) => {
  try {
    const listings = await store.listListings({ search: String(req.query.q || ''), status: 'published' });
    res.json({ ok: true, listings });
  } catch (error) {
    next(error);
  }
});

app.get('/api/owner/session', (req, res) => {
  res.json({ ok: true, authenticated: Boolean(req.session?.ownerAuthenticated) });
});

app.post('/api/owner/login', async (req, res, next) => {
  try {
    const password = String(req.body.password || '');
    const valid = await validateOwnerPassword(password);
    if (!valid) {
      res.status(401).json({ ok: false, error: 'INVALID_PASSWORD' });
      return;
    }
    req.session.ownerAuthenticated = true;
    res.json({ ok: true, authenticated: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/owner/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.get('/api/owner/bootstrap', requireOwner, async (_req, res, next) => {
  try {
    const [categories, listings, collections, banners] = await Promise.all([
      store.listCategories(),
      store.listListings({ status: undefined }),
      store.listCollections(),
      store.listBanners()
    ]);
    res.json({ ok: true, categories, listings, collections, banners });
  } catch (error) {
    next(error);
  }
});

app.post('/api/owner/upload', requireOwner, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ ok: false, error: 'NO_FILE' });
      return;
    }
    const extension = '.jpg';
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const targetPath = path.join(uploadDir, fileName);

    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(targetPath);

    res.json({ ok: true, url: `/uploads/${fileName}` });
  } catch (error) {
    next(error);
  }
});

app.post('/api/owner/listings', requireOwner, async (req, res, next) => {
  try {
    const payload = sanitizeListingPayload(req.body);
    if (!payload.categorySlug || !payload.title) {
      res.status(400).json({ ok: false, error: 'TITLE_AND_CATEGORY_REQUIRED' });
      return;
    }
    const listing = await store.upsertListing(payload);
    res.json({ ok: true, listing });
  } catch (error) {
    next(error);
  }
});

app.put('/api/owner/listings/:id', requireOwner, async (req, res, next) => {
  try {
    const payload = sanitizeListingPayload({ ...req.body, id: req.params.id });
    const listing = await store.upsertListing(payload);
    res.json({ ok: true, listing });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/owner/listings/:id', requireOwner, async (req, res, next) => {
  try {
    await store.deleteListing(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.put('/api/owner/collections/:slug/items', requireOwner, async (req, res, next) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    await store.replaceCollectionItems(req.params.slug, items);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.put('/api/owner/banners', requireOwner, async (req, res, next) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    await store.replaceBanners(items);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ ok: false, error: 'SERVER_ERROR', message: error.message });
});

app.get('*', (_req, res) => {
  const filePath = path.join(webDistPath, 'index.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
    return;
  }
  res.status(404).send('Frontend build not found');
});

async function start() {
  try {
    await store.init();
    app.listen(PORT, () => {
      console.log(`Guide app server started on port ${PORT}`);
      console.log(`Uploads dir: ${uploadDir}`);
      console.log(`Data mode: ${hasDatabase ? 'postgres' : 'memory fallback'}`);
    });
  } catch (error) {
    console.error('Failed to start guide app server', error);
    process.exit(1);
  }
}

start();
