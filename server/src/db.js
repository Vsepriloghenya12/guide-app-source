const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const seedPath = path.resolve(__dirname, '../../shared/default-guide-content.json');
const defaultContent = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

let pool = null;
let dbReadyPromise = null;

function getSslConfig() {
  const mode = String(process.env.PGSSLMODE || '').toLowerCase();
  const explicit = String(process.env.DATABASE_SSL || '').toLowerCase();

  if (explicit === 'true' || mode === 'require') {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: getSslConfig()
    });
  }

  return pool;
}

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function cloneDefaultContent() {
  return JSON.parse(JSON.stringify(defaultContent));
}

async function ensureDatabase() {
  const currentPool = getPool();

  if (!currentPool) {
    return false;
  }

  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      await currentPool.query(`
        create table if not exists app_content (
          key text primary key,
          data jsonb not null,
          updated_at timestamptz not null default now()
        )
      `);

      await currentPool.query(`
        create table if not exists analytics_events (
          id text primary key,
          kind text not null,
          label text not null,
          path text not null,
          entity_id text,
          category_id text,
          created_at timestamptz not null
        )
      `);

      await currentPool.query(
        `create index if not exists analytics_events_created_at_idx on analytics_events (created_at desc)`
      );

      const existing = await currentPool.query('select key from app_content where key = $1', ['guide-content']);
      if (existing.rowCount === 0) {
        const seed = cloneDefaultContent();
        delete seed.analytics;
        await currentPool.query(
          `insert into app_content (key, data, updated_at) values ($1, $2::jsonb, now())`,
          ['guide-content', JSON.stringify(seed)]
        );
      }

      return true;
    })().catch((error) => {
      dbReadyPromise = null;
      throw error;
    });
  }

  return dbReadyPromise;
}

function normalizeContentStore(input) {
  const defaults = cloneDefaultContent();
  const base = input && typeof input === 'object' ? input : {};
  const places = Array.isArray(base.places) ? base.places : defaults.places;

  return {
    version: 4,
    places,
    categories: Array.isArray(base.categories) ? base.categories : defaults.categories,
    tips: Array.isArray(base.tips) ? base.tips : defaults.tips,
    banners: Array.isArray(base.banners) ? base.banners : defaults.banners,
    collections: Array.isArray(base.collections) ? base.collections : defaults.collections,
    home: base.home && typeof base.home === 'object' ? base.home : defaults.home,
    analytics: {
      events: Array.isArray(base.analytics?.events) ? base.analytics.events.slice(-400) : []
    },
    restaurants: places.filter((place) => place.categoryId === 'restaurants'),
    wellness: places.filter((place) => place.categoryId === 'wellness')
  };
}

async function getAnalyticsEvents(limit = 400) {
  const currentPool = getPool();
  if (!currentPool) {
    return [];
  }

  await ensureDatabase();

  const result = await currentPool.query(
    `
      select id, kind, label, path, entity_id as "entityId", category_id as "categoryId", created_at as "createdAt"
      from analytics_events
      order by created_at desc
      limit $1
    `,
    [limit]
  );

  return result.rows.reverse();
}

async function getContentStore() {
  const currentPool = getPool();
  if (!currentPool) {
    return normalizeContentStore(cloneDefaultContent());
  }

  await ensureDatabase();

  const contentResult = await currentPool.query('select data from app_content where key = $1 limit 1', ['guide-content']);
  const data = contentResult.rows[0]?.data || cloneDefaultContent();
  const analyticsEvents = await getAnalyticsEvents(400);

  return normalizeContentStore({
    ...data,
    analytics: {
      events: analyticsEvents
    }
  });
}

async function saveContentStore(store) {
  const currentPool = getPool();
  if (!currentPool) {
    return normalizeContentStore(store);
  }

  await ensureDatabase();

  const normalized = normalizeContentStore(store);
  const dataToSave = { ...normalized };
  delete dataToSave.analytics;
  delete dataToSave.restaurants;
  delete dataToSave.wellness;

  await currentPool.query(
    `
      insert into app_content (key, data, updated_at)
      values ($1, $2::jsonb, now())
      on conflict (key)
      do update set data = excluded.data, updated_at = now()
    `,
    ['guide-content', JSON.stringify(dataToSave)]
  );

  const analyticsEvents = await getAnalyticsEvents(400);
  return normalizeContentStore({
    ...dataToSave,
    analytics: {
      events: analyticsEvents
    }
  });
}

async function resetContentStore() {
  const seed = cloneDefaultContent();
  seed.analytics = { events: [] };

  const currentPool = getPool();
  if (!currentPool) {
    return normalizeContentStore(seed);
  }

  await ensureDatabase();
  await currentPool.query('delete from analytics_events');
  return saveContentStore(seed);
}

async function appendAnalyticsEvent(event) {
  const currentPool = getPool();
  if (!currentPool) {
    return event;
  }

  await ensureDatabase();

  await currentPool.query(
    `
      insert into analytics_events (id, kind, label, path, entity_id, category_id, created_at)
      values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (id) do nothing
    `,
    [
      event.id,
      event.kind,
      event.label,
      event.path,
      event.entityId || null,
      event.categoryId || null,
      event.createdAt
    ]
  );

  return event;
}

module.exports = {
  appendAnalyticsEvent,
  cloneDefaultContent,
  ensureDatabase,
  getContentStore,
  getPool,
  hasDatabase,
  normalizeContentStore,
  resetContentStore,
  saveContentStore
};
