const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');
const { defaultListings, defaultSettings } = require('./defaultData');

const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');
const HAS_DATABASE = Boolean(process.env.DATABASE_URL);
const pool = HAS_DATABASE ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;

function normalizePath(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStatus(value) {
  return ['published', 'draft', 'hidden'].includes(value) ? value : 'published';
}

function normalizeRestaurant(payload) {
  return {
    id: payload.id,
    category: 'restaurants',
    title: normalizePath(payload.title),
    kind: ['restaurant', 'club', 'canteen', 'coffee'].includes(payload.kind)
      ? payload.kind
      : 'restaurant',
    cuisine: ['european', 'caucasian', 'thai', 'vietnamese'].includes(payload.cuisine)
      ? payload.cuisine
      : 'european',
    breakfast: Boolean(payload.breakfast),
    vegan: Boolean(payload.vegan),
    pets: Boolean(payload.pets),
    avgCheck: Number(payload.avgCheck || 0),
    address: normalizePath(payload.address),
    description: normalizePath(payload.description),
    rating: Number(payload.rating || 0),
    imageLabel: normalizePath(payload.imageLabel) || 'Карточка ресторана',
    imageUrl: normalizePath(payload.imageUrl),
    phone: normalizePath(payload.phone),
    website: normalizePath(payload.website),
    hours: normalizePath(payload.hours),
    isFeatured: Boolean(payload.isFeatured),
    featuredRank: Number(payload.featuredRank || 0),
    status: normalizeStatus(payload.status)
  };
}

function normalizeWellness(payload) {
  const services = Array.isArray(payload.services)
    ? payload.services.filter((service) =>
        ['massage', 'sauna', 'spa', 'hammam', 'cosmetology', 'wraps', 'yoga'].includes(service)
      )
    : [];

  return {
    id: payload.id,
    category: 'wellness',
    title: normalizePath(payload.title),
    services,
    childPrograms: Boolean(payload.childPrograms),
    address: normalizePath(payload.address),
    description: normalizePath(payload.description),
    rating: Number(payload.rating || 0),
    imageLabel: normalizePath(payload.imageLabel) || 'СПА карточка',
    imageUrl: normalizePath(payload.imageUrl),
    phone: normalizePath(payload.phone),
    website: normalizePath(payload.website),
    hours: normalizePath(payload.hours),
    isFeatured: Boolean(payload.isFeatured),
    featuredRank: Number(payload.featuredRank || 0),
    status: normalizeStatus(payload.status)
  };
}

function listingFromRow(row) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    kind: row.restaurant_kind || undefined,
    cuisine: row.restaurant_cuisine || undefined,
    breakfast: Boolean(row.breakfast),
    vegan: Boolean(row.vegan),
    pets: Boolean(row.pets),
    avgCheck: Number(row.avg_check || 0),
    address: row.address,
    description: row.description,
    rating: Number(row.rating || 0),
    imageLabel: row.image_label || '',
    imageUrl: row.image_url || '',
    phone: row.phone || '',
    website: row.website || '',
    hours: row.hours || '',
    isFeatured: Boolean(row.is_featured),
    featuredRank: Number(row.featured_rank || 0),
    status: normalizeStatus(row.status),
    services: Array.isArray(row.wellness_services) ? row.wellness_services : [],
    childPrograms: Boolean(row.child_programs)
  };
}

function toPublicRestaurant(item) {
  return normalizeRestaurant(item);
}

function toPublicWellness(item) {
  return normalizeWellness(item);
}

function buildFeaturedItem(item) {
  return {
    id: item.id,
    title: item.title,
    path: item.category === 'restaurants' ? '/restaurants' : '/wellness',
    imageUrl: item.imageUrl || '',
    imageLabel: item.imageLabel || item.title,
    category: item.category
  };
}

function getDefaultSnapshot() {
  return {
    listings: defaultListings,
    settings: defaultSettings
  };
}

async function ensureFileStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(getDefaultSnapshot(), null, 2), 'utf8');
  }
}

async function readFileSnapshot() {
  await ensureFileStore();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const parsed = JSON.parse(raw || '{}');

  return {
    listings: Array.isArray(parsed.listings) ? parsed.listings : defaultListings,
    settings: typeof parsed.settings === 'object' && parsed.settings ? parsed.settings : defaultSettings
  };
}

async function writeFileSnapshot(snapshot) {
  await ensureFileStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
}

async function initializeDatabase() {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      rating DOUBLE PRECISION NOT NULL DEFAULT 0,
      image_label TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      hours TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'published',
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      featured_rank INTEGER NOT NULL DEFAULT 0,
      restaurant_kind TEXT,
      restaurant_cuisine TEXT,
      breakfast BOOLEAN NOT NULL DEFAULT FALSE,
      vegan BOOLEAN NOT NULL DEFAULT FALSE,
      pets BOOLEAN NOT NULL DEFAULT FALSE,
      avg_check INTEGER NOT NULL DEFAULT 0,
      wellness_services JSONB NOT NULL DEFAULT '[]'::jsonb,
      child_programs BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM listings');
  if (rows[0]?.count > 0) {
    return;
  }

  for (const item of defaultListings) {
    await upsertListingInDatabase(item);
  }

  await pool.query(
    `INSERT INTO app_settings(key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    ['homeTips', JSON.stringify(defaultSettings.homeTips)]
  );
}

async function readDatabaseSnapshot() {
  const listingsResult = await pool.query('SELECT * FROM listings ORDER BY category, rating DESC, title ASC');
  const settingsResult = await pool.query('SELECT key, value FROM app_settings');

  const settings = { ...defaultSettings };
  for (const row of settingsResult.rows) {
    settings[row.key] = row.value;
  }

  return {
    listings: listingsResult.rows.map(listingFromRow),
    settings
  };
}

async function upsertListingInDatabase(item) {
  const normalized = item.category === 'restaurants' ? normalizeRestaurant(item) : normalizeWellness(item);
  await pool.query(
    `
      INSERT INTO listings (
        id, category, title, address, description, rating, image_label, image_url, phone, website, hours,
        status, is_featured, featured_rank, restaurant_kind, restaurant_cuisine, breakfast, vegan, pets,
        avg_check, wellness_services, child_programs, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,$17,$18,$19,
        $20,$21::jsonb,$22,NOW()
      )
      ON CONFLICT (id)
      DO UPDATE SET
        category = EXCLUDED.category,
        title = EXCLUDED.title,
        address = EXCLUDED.address,
        description = EXCLUDED.description,
        rating = EXCLUDED.rating,
        image_label = EXCLUDED.image_label,
        image_url = EXCLUDED.image_url,
        phone = EXCLUDED.phone,
        website = EXCLUDED.website,
        hours = EXCLUDED.hours,
        status = EXCLUDED.status,
        is_featured = EXCLUDED.is_featured,
        featured_rank = EXCLUDED.featured_rank,
        restaurant_kind = EXCLUDED.restaurant_kind,
        restaurant_cuisine = EXCLUDED.restaurant_cuisine,
        breakfast = EXCLUDED.breakfast,
        vegan = EXCLUDED.vegan,
        pets = EXCLUDED.pets,
        avg_check = EXCLUDED.avg_check,
        wellness_services = EXCLUDED.wellness_services,
        child_programs = EXCLUDED.child_programs,
        updated_at = NOW()
    `,
    [
      normalized.id,
      normalized.category,
      normalized.title,
      normalized.address,
      normalized.description,
      normalized.rating,
      normalized.imageLabel,
      normalized.imageUrl,
      normalized.phone,
      normalized.website,
      normalized.hours,
      normalized.status,
      normalized.isFeatured,
      normalized.featuredRank,
      normalized.kind || null,
      normalized.cuisine || null,
      normalized.breakfast || false,
      normalized.vegan || false,
      normalized.pets || false,
      normalized.avgCheck || 0,
      JSON.stringify(normalized.services || []),
      normalized.childPrograms || false
    ]
  );

  return normalized;
}

async function writeSettingsInDatabase(settings) {
  await pool.query(
    `INSERT INTO app_settings(key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    ['homeTips', JSON.stringify(settings.homeTips || defaultSettings.homeTips)]
  );
}

async function initializeStore() {
  if (HAS_DATABASE) {
    await initializeDatabase();
    return;
  }

  await ensureFileStore();
}

async function getSnapshot() {
  if (HAS_DATABASE) {
    return readDatabaseSnapshot();
  }

  return readFileSnapshot();
}

async function getPublicContent() {
  const snapshot = await getSnapshot();
  const publishedListings = snapshot.listings.filter((item) => normalizeStatus(item.status) === 'published');
  const restaurants = publishedListings
    .filter((item) => item.category === 'restaurants')
    .sort((left, right) => right.rating - left.rating)
    .map(toPublicRestaurant);
  const wellness = publishedListings
    .filter((item) => item.category === 'wellness')
    .sort((left, right) => right.rating - left.rating)
    .map(toPublicWellness);
  const featured = publishedListings
    .filter((item) => item.isFeatured)
    .sort((left, right) => right.featuredRank - left.featuredRank || right.rating - left.rating)
    .slice(0, 2)
    .map(buildFeaturedItem);

  return {
    restaurants,
    wellness,
    featured,
    tips: Array.isArray(snapshot.settings.homeTips) ? snapshot.settings.homeTips : defaultSettings.homeTips
  };
}

async function getOwnerContent() {
  const snapshot = await getSnapshot();
  const restaurants = snapshot.listings
    .filter((item) => item.category === 'restaurants')
    .sort((left, right) => right.rating - left.rating)
    .map(toPublicRestaurant);
  const wellness = snapshot.listings
    .filter((item) => item.category === 'wellness')
    .sort((left, right) => right.rating - left.rating)
    .map(toPublicWellness);

  return {
    restaurants,
    wellness,
    settings: {
      homeTips: Array.isArray(snapshot.settings.homeTips) ? snapshot.settings.homeTips : defaultSettings.homeTips
    }
  };
}

async function upsertRestaurant(item) {
  const normalized = normalizeRestaurant(item);

  if (HAS_DATABASE) {
    return upsertListingInDatabase(normalized);
  }

  const snapshot = await readFileSnapshot();
  const nextListings = snapshot.listings.filter((entry) => entry.id !== normalized.id);
  nextListings.unshift(normalized);
  await writeFileSnapshot({ ...snapshot, listings: nextListings });
  return normalized;
}

async function upsertWellness(item) {
  const normalized = normalizeWellness(item);

  if (HAS_DATABASE) {
    return upsertListingInDatabase(normalized);
  }

  const snapshot = await readFileSnapshot();
  const nextListings = snapshot.listings.filter((entry) => entry.id !== normalized.id);
  nextListings.unshift(normalized);
  await writeFileSnapshot({ ...snapshot, listings: nextListings });
  return normalized;
}

async function deleteListing(category, id) {
  if (HAS_DATABASE) {
    await pool.query('DELETE FROM listings WHERE id = $1 AND category = $2', [id, category]);
    return;
  }

  const snapshot = await readFileSnapshot();
  await writeFileSnapshot({
    ...snapshot,
    listings: snapshot.listings.filter((entry) => !(entry.id === id && entry.category === category))
  });
}

async function saveHomeTips(homeTips) {
  const nextSettings = {
    homeTips: Array.isArray(homeTips)
      ? homeTips.map((tip, index) => ({
          id: tip.id || `tip-${index + 1}`,
          title: normalizePath(tip.title),
          path: normalizePath(tip.path) || '/'
        }))
      : defaultSettings.homeTips
  };

  if (HAS_DATABASE) {
    await writeSettingsInDatabase(nextSettings);
    return nextSettings;
  }

  const snapshot = await readFileSnapshot();
  await writeFileSnapshot({ ...snapshot, settings: nextSettings });
  return nextSettings;
}

module.exports = {
  initializeStore,
  getPublicContent,
  getOwnerContent,
  upsertRestaurant,
  upsertWellness,
  deleteListing,
  saveHomeTips,
  HAS_DATABASE
};
