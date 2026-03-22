const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let postgres = null;
try {
  postgres = require('postgres');
} catch {
  postgres = null;
}

const seedPath = path.resolve(__dirname, '../../shared/default-guide-content.json');
const defaultContent = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const defaultSupportContent = {
  heroEyebrow: 'На связи',
  heroTitle: 'Все важные контакты в одном месте',
  heroText: 'Здесь собраны основные каналы связи, чтобы телефон, Telegram и WhatsApp всегда были под рукой. Ниже также есть важные номера для экстренных ситуаций.',
  helpButtonLabel: 'Открыть помощь',
  emergencyTitle: 'Экстренные контакты',
  emergencySubtitle: 'Полезно сохранить до поездки или держать под рукой в офлайн-режиме.',
  contactChannels: [
    { id: 'telegram', title: 'Telegram', subtitle: 'Быстрые вопросы, рекомендации и помощь по приложению.', value: '@danangguide_support', href: 'https://t.me/danangguide_support', kind: 'telegram' },
    { id: 'whatsapp', title: 'WhatsApp', subtitle: 'Удобно для быстрых сообщений и отправки локации.', value: '+84 90 000 90 90', href: 'https://wa.me/84900009090', kind: 'whatsapp' },
    { id: 'phone', title: 'Телефон', subtitle: 'Срочный звонок, если нужна помощь или уточнение по контакту.', value: '+84 90 000 90 90', href: 'tel:+84900009090', kind: 'phone' },
    { id: 'email', title: 'Email', subtitle: 'Для партнёрств, размещения и подробных запросов.', value: 'hello@danangguide.app', href: 'mailto:hello@danangguide.app', kind: 'email' },
    { id: 'instagram', title: 'Instagram', subtitle: 'Актуальные анонсы и подборки.', value: '@danangguide.app', href: 'https://instagram.com/danangguide.app', kind: 'instagram' }
  ],
  emergencyContacts: [
    { id: 'police', title: 'Полиция', description: 'Экстренная помощь и безопасность.', value: '113', href: 'tel:113' },
    { id: 'fire', title: 'Пожарная служба', description: 'Пожар, задымление, угроза жизни.', value: '114', href: 'tel:114' },
    { id: 'ambulance', title: 'Скорая помощь', description: 'Медицинская экстренная помощь.', value: '115', href: 'tel:115' },
    { id: 'tourist-help', title: 'Туристическая помощь', description: 'Локальная помощь по логистике, утерянным вещам и маршрутам.', value: '+84 90 000 90 90', href: 'tel:+84900009090' }
  ]
};

let sql = null;
let dbReadyPromise = null;
let memoryStore = null;
let memorySupportContent = null;

function getSslConfig() {
  const mode = String(process.env.PGSSLMODE || '').toLowerCase();
  const explicit = String(process.env.DATABASE_SSL || '').toLowerCase();

  if (explicit === 'true' || mode === 'require') {
    return 'require';
  }

  return undefined;
}

function getSql() {
  if (!process.env.DATABASE_URL || !postgres) {
    return null;
  }

  if (!sql) {
    sql = postgres(process.env.DATABASE_URL, {
      ssl: getSslConfig(),
      max: 5,
      prepare: false
    });
  }

  return sql;
}

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function cloneDefaultContent() {
  return JSON.parse(JSON.stringify(defaultContent));
}

function cloneDefaultSupportContent() {
  return JSON.parse(JSON.stringify(defaultSupportContent));
}

function normalizeSupportContent(input) {
  const base = input && typeof input === 'object' ? input : {};
  const defaults = cloneDefaultSupportContent();
  const normalizeChannel = (channel, index) => ({
    id: String(channel?.id || `contact-${index + 1}`).trim(),
    title: String(channel?.title || '').trim(),
    subtitle: String(channel?.subtitle || '').trim(),
    value: String(channel?.value || '').trim(),
    href: String(channel?.href || '').trim(),
    kind: ['telegram', 'whatsapp', 'phone', 'email', 'instagram'].includes(String(channel?.kind)) ? String(channel.kind) : 'telegram'
  });
  const normalizeEmergency = (contact, index) => ({
    id: String(contact?.id || `emergency-${index + 1}`).trim(),
    title: String(contact?.title || '').trim(),
    description: String(contact?.description || '').trim(),
    value: String(contact?.value || '').trim(),
    href: String(contact?.href || '').trim()
  });

  return {
    heroEyebrow: String(base.heroEyebrow || defaults.heroEyebrow).trim(),
    heroTitle: String(base.heroTitle || defaults.heroTitle).trim(),
    heroText: String(base.heroText || defaults.heroText).trim(),
    helpButtonLabel: String(base.helpButtonLabel || defaults.helpButtonLabel).trim(),
    emergencyTitle: String(base.emergencyTitle || defaults.emergencyTitle).trim(),
    emergencySubtitle: String(base.emergencySubtitle || defaults.emergencySubtitle).trim(),
    contactChannels: (Array.isArray(base.contactChannels) ? base.contactChannels : defaults.contactChannels).map(normalizeChannel),
    emergencyContacts: (Array.isArray(base.emergencyContacts) ? base.emergencyContacts : defaults.emergencyContacts).map(normalizeEmergency)
  };
}

function getMemorySupportContent() {
  if (!memorySupportContent) {
    memorySupportContent = normalizeSupportContent(cloneDefaultSupportContent());
  }
  return JSON.parse(JSON.stringify(memorySupportContent));
}

function setMemorySupportContent(content) {
  memorySupportContent = normalizeSupportContent(content);
  return getMemorySupportContent();
}

function getMemoryStore() {
  if (!memoryStore) {
    memoryStore = normalizeContentStore(cloneDefaultContent());
  }
  return JSON.parse(JSON.stringify(memoryStore));
}

function setMemoryStore(store) {
  memoryStore = normalizeContentStore(store);
  return getMemoryStore();
}

function slugify(value, fallback = 'item') {
  return String(value || fallback)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || fallback;
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item || '').trim()).filter(Boolean) : [];
}

function toBoolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function toNullableNumber(value) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function coerceStatus(value) {
  return ['draft', 'hidden', 'published'].includes(value) ? value : 'published';
}

function normalizeCategory(category, index, fallbackMap) {
  const fallback = fallbackMap.get(category?.id) || fallbackMap.get(category?.slug) || {};
  const id = String(category?.id || fallback.id || '').trim();
  const slug = String(category?.slug || fallback.slug || id || `category-${index + 1}`).trim();

  return {
    id,
    title: String(category?.title || fallback.title || id).trim(),
    path: String(category?.path || fallback.path || `/section/${slug}`).trim(),
    badge: String(category?.badge || fallback.badge || '').trim(),
    description: String(category?.description || fallback.description || '').trim(),
    visible: category?.visible ?? fallback.visible ?? true,
    showOnHome: category?.showOnHome ?? fallback.showOnHome ?? false,
    slug,
    shortTitle: String(category?.shortTitle || fallback.shortTitle || category?.title || fallback.title || id).trim(),
    accent: String(category?.accent || fallback.accent || 'coast').trim(),
    imageSrc: String(category?.imageSrc || fallback.imageSrc || '').trim(),
    filterSchema: {
      quickFilters: normalizeStringArray(category?.filterSchema?.quickFilters ?? fallback.filterSchema?.quickFilters),
      fields: normalizeStringArray(category?.filterSchema?.fields ?? fallback.filterSchema?.fields)
    },
    sortOrder: Number.isFinite(Number(category?.sortOrder)) ? Number(category.sortOrder) : index * 10 + 10
  };
}

function normalizePlace(place, index, fallbackPlace = {}) {
  const categoryId = String(place?.categoryId || fallbackPlace.categoryId || 'restaurants').trim();
  const imageGallery = normalizeStringArray(place?.imageGallery ?? place?.imageUrls ?? fallbackPlace.imageGallery ?? fallbackPlace.imageUrls);
  const imageSrc = String(place?.imageSrc || place?.coverImageUrl || imageGallery[0] || fallbackPlace.imageSrc || fallbackPlace.coverImageUrl || '').trim();
  const finalGallery = imageGallery.length ? imageGallery : imageSrc ? [imageSrc] : [];
  const title = String(place?.title || fallbackPlace.title || '').trim();

  return {
    id: String(place?.id || fallbackPlace.id || crypto.randomUUID()).trim(),
    categoryId,
    title,
    description: String(place?.description || place?.shortDescription || fallbackPlace.description || '').trim(),
    address: String(place?.address || place?.location || fallbackPlace.address || '').trim(),
    phone: String(place?.phone || place?.phoneNumber || fallbackPlace.phone || '').trim(),
    website: String(place?.website || place?.websiteUrl || fallbackPlace.website || '').trim(),
    hours: String(place?.hours || fallbackPlace.hours || '').trim(),
    avgCheck: toNullableNumber(place?.avgCheck ?? fallbackPlace.avgCheck),
    kind: String(place?.kind || place?.listingType || place?.type || fallbackPlace.kind || '').trim(),
    cuisine: String(place?.cuisine || fallbackPlace.cuisine || '').trim(),
    services: normalizeStringArray(place?.services ?? place?.extra ?? fallbackPlace.services),
    tags: normalizeStringArray(place?.tags ?? fallbackPlace.tags),
    breakfast: toBoolean(place?.breakfast, fallbackPlace.breakfast ?? false),
    vegan: toBoolean(place?.vegan, fallbackPlace.vegan ?? false),
    pets: toBoolean(place?.pets ?? place?.petFriendly, fallbackPlace.pets ?? false),
    childPrograms: toBoolean(place?.childPrograms ?? place?.childFriendly, fallbackPlace.childPrograms ?? false),
    top: toBoolean(place?.top ?? place?.featured, fallbackPlace.top ?? false),
    rating: Number(place?.rating ?? fallbackPlace.rating ?? 0) || 0,
    imageLabel: String(place?.imageLabel || fallbackPlace.imageLabel || title || 'Карточка места').trim(),
    imageSrc,
    imageGallery: finalGallery,
    slug: String(place?.slug || fallbackPlace.slug || `${categoryId}-${slugify(title, String(place?.id || index + 1))}`).trim(),
    categorySlug: String(place?.categorySlug || fallbackPlace.categorySlug || categoryId).trim(),
    featured: toBoolean(place?.featured ?? place?.top, fallbackPlace.featured ?? fallbackPlace.top ?? false),
    shortDescription: String(place?.shortDescription || place?.description || fallbackPlace.shortDescription || fallbackPlace.description || '').trim(),
    priceLabel: String(place?.priceLabel || fallbackPlace.priceLabel || '').trim(),
    listingType: String(place?.listingType || place?.kind || fallbackPlace.listingType || fallbackPlace.kind || '').trim(),
    childFriendly: toBoolean(place?.childFriendly ?? place?.childPrograms, fallbackPlace.childFriendly ?? fallbackPlace.childPrograms ?? false),
    petFriendly: toBoolean(place?.petFriendly ?? place?.pets, fallbackPlace.petFriendly ?? fallbackPlace.pets ?? false),
    mapQuery: String(place?.mapQuery || place?.address || fallbackPlace.mapQuery || fallbackPlace.address || '').trim(),
    extra: normalizeStringArray(place?.extra ?? place?.services ?? fallbackPlace.extra ?? fallbackPlace.services),
    imageUrls: finalGallery,
    coverImageUrl: String(place?.coverImageUrl || imageSrc || fallbackPlace.coverImageUrl || '').trim(),
    websiteUrl: String(place?.websiteUrl || place?.website || fallbackPlace.websiteUrl || fallbackPlace.website || '').trim(),
    phoneNumber: String(place?.phoneNumber || place?.phone || fallbackPlace.phoneNumber || fallbackPlace.phone || '').trim(),
    district: String(place?.district || fallbackPlace.district || '').trim(),
    location: String(place?.location || place?.address || fallbackPlace.location || fallbackPlace.address || '').trim(),
    type: String(place?.type || place?.kind || fallbackPlace.type || fallbackPlace.kind || '').trim(),
    status: coerceStatus(place?.status || fallbackPlace.status),
    sortOrder: Number.isFinite(Number(place?.sortOrder)) ? Number(place.sortOrder) : Number.isFinite(Number(fallbackPlace.sortOrder)) ? Number(fallbackPlace.sortOrder) : index * 10 + 10,
    lat: toNullableNumber(place?.lat ?? fallbackPlace.lat),
    lng: toNullableNumber(place?.lng ?? fallbackPlace.lng),
    visible: place?.visible ?? fallbackPlace.visible ?? (coerceStatus(place?.status || fallbackPlace.status) !== 'hidden')
  };
}

function normalizeTip(tip, index) {
  return {
    id: String(tip?.id || `tip-${index + 1}`).trim(),
    title: String(tip?.title || '').trim(),
    text: String(tip?.text || '').trim(),
    linkPath: String(tip?.linkPath || tip?.path || '').trim(),
    active: tip?.active ?? true,
    sortOrder: Number.isFinite(Number(tip?.sortOrder)) ? Number(tip.sortOrder) : index * 10 + 10
  };
}

function normalizeBanner(banner, index) {
  return {
    id: String(banner?.id || `banner-${index + 1}`).trim(),
    title: String(banner?.title || '').trim(),
    subtitle: String(banner?.subtitle || '').trim(),
    linkPath: String(banner?.linkPath || '').trim(),
    tone: String(banner?.tone || 'coast').trim(),
    imageSrc: String(banner?.imageSrc || '').trim(),
    active: banner?.active ?? true,
    sortOrder: Number.isFinite(Number(banner?.sortOrder)) ? Number(banner.sortOrder) : index * 10 + 10
  };
}

function normalizeCollection(collection, index) {
  return {
    id: String(collection?.id || `collection-${index + 1}`).trim(),
    title: String(collection?.title || '').trim(),
    description: String(collection?.description || '').trim(),
    linkPath: String(collection?.linkPath || '').trim(),
    imageSrc: String(collection?.imageSrc || '').trim(),
    itemIds: normalizeStringArray(collection?.itemIds),
    active: collection?.active ?? true,
    sortOrder: Number.isFinite(Number(collection?.sortOrder)) ? Number(collection.sortOrder) : index * 10 + 10
  };
}

function normalizeContentStore(input) {
  const defaults = cloneDefaultContent();
  const base = input && typeof input === 'object' ? input : {};
  const defaultCategoryMap = new Map(defaults.categories.map((item) => [item.id, item]));

  const categories = (Array.isArray(base.categories) ? base.categories : defaults.categories)
    .map((item, index) => normalizeCategory(item, index, defaultCategoryMap))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  const placeFallbackMap = new Map((Array.isArray(defaults.places) ? defaults.places : []).map((item) => [item.id, item]));
  const places = (Array.isArray(base.places) ? base.places : defaults.places)
    .map((item, index) => normalizePlace(item, index, placeFallbackMap.get(item?.id)))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  const tips = (Array.isArray(base.tips) ? base.tips : defaults.tips)
    .map(normalizeTip)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  const banners = (Array.isArray(base.banners) ? base.banners : defaults.banners)
    .map(normalizeBanner)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  const collections = (Array.isArray(base.collections) ? base.collections : defaults.collections)
    .map(normalizeCollection)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  const homeDefaults = defaults.home || {};
  const homeInput = base.home && typeof base.home === 'object' ? base.home : {};

  return {
    version: 4,
    places,
    categories,
    tips,
    banners,
    collections,
    home: {
      popularPlaceIds: normalizeStringArray(homeInput.popularPlaceIds ?? homeDefaults.popularPlaceIds),
      featuredCategoryIds: normalizeStringArray(homeInput.featuredCategoryIds ?? homeDefaults.featuredCategoryIds),
      tipIds: normalizeStringArray(homeInput.tipIds ?? homeDefaults.tipIds),
      bannerIds: normalizeStringArray(homeInput.bannerIds ?? homeDefaults.bannerIds),
      collectionIds: normalizeStringArray(homeInput.collectionIds ?? homeDefaults.collectionIds),
      sectionTitles: {
        popular: String(homeInput.sectionTitles?.popular || homeDefaults.sectionTitles?.popular || 'Популярное').trim(),
        categories: String(homeInput.sectionTitles?.categories || homeDefaults.sectionTitles?.categories || 'Категории').trim(),
        tips: String(homeInput.sectionTitles?.tips || homeDefaults.sectionTitles?.tips || 'Советы').trim(),
        collections: String(homeInput.sectionTitles?.collections || homeDefaults.sectionTitles?.collections || 'Подборки').trim(),
        allCategories: String(homeInput.sectionTitles?.allCategories || homeDefaults.sectionTitles?.allCategories || 'Все категории').trim()
      }
    },
    analytics: {
      events: Array.isArray(base.analytics?.events) ? base.analytics.events.slice(-400) : []
    },
    restaurants: places.filter((place) => place.categoryId === 'restaurants'),
    wellness: places.filter((place) => place.categoryId === 'wellness')
  };
}

async function ensureDatabase() {
  const db = getSql();
  if (!db) {
    return false;
  }

  if (!dbReadyPromise) {
    dbReadyPromise = (async () => {
      await db.unsafe(`
        create table if not exists categories (
          id text primary key,
          title text not null,
          path text not null,
          badge text not null default '',
          description text not null default '',
          visible boolean not null default true,
          show_on_home boolean not null default false,
          slug text not null unique,
          short_title text not null default '',
          accent text not null default 'coast',
          image_src text not null default '',
          filter_schema jsonb not null default '{}'::jsonb,
          sort_order integer not null default 100,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);

      await db.unsafe(`alter table categories add column if not exists image_src text not null default ''`);

      await db.unsafe(`
        create table if not exists places (
          id text primary key,
          category_id text not null references categories(id) on delete cascade,
          slug text not null unique,
          title text not null,
          description text not null default '',
          address text not null default '',
          phone text not null default '',
          website text not null default '',
          hours text not null default '',
          avg_check numeric,
          kind text not null default '',
          cuisine text not null default '',
          services jsonb not null default '[]'::jsonb,
          tags jsonb not null default '[]'::jsonb,
          breakfast boolean not null default false,
          vegan boolean not null default false,
          pets boolean not null default false,
          child_programs boolean not null default false,
          top boolean not null default false,
          rating numeric not null default 0,
          image_label text not null default '',
          image_src text not null default '',
          status text not null default 'published' check (status in ('draft','hidden','published')),
          sort_order integer not null default 100,
          lat double precision,
          lng double precision,
          map_query text not null default '',
          district text not null default '',
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);

      await db.unsafe(`
        create table if not exists place_images (
          id text primary key,
          place_id text not null references places(id) on delete cascade,
          image_url text not null,
          sort_order integer not null default 100,
          is_cover boolean not null default false,
          created_at timestamptz not null default now()
        )
      `);

      await db.unsafe(`
        create index if not exists place_images_place_id_idx on place_images(place_id, sort_order)
      `);

      await db.unsafe(`
        create table if not exists media_files (
          id text primary key,
          kind text not null default 'general',
          file_name text not null default '',
          mime_type text not null default '',
          size_bytes integer not null default 0,
          storage_path text not null,
          public_url text not null,
          created_at timestamptz not null default now()
        )
      `);

      await db.unsafe(`
        create index if not exists media_files_created_at_idx on media_files (created_at desc)
      `);

      await db.unsafe(`
        create table if not exists tips (
          id text primary key,
          title text not null,
          text text not null default '',
          link_path text not null default '',
          active boolean not null default true,
          sort_order integer not null default 100,
          updated_at timestamptz not null default now()
        )
      `);

      await db.unsafe(`
        create table if not exists banners (
          id text primary key,
          title text not null,
          subtitle text not null default '',
          link_path text not null default '',
          tone text not null default 'coast',
          image_src text not null default '',
          active boolean not null default true,
          sort_order integer not null default 100,
          updated_at timestamptz not null default now()
        )
      `);

      await db.unsafe(`
        create table if not exists collections (
          id text primary key,
          title text not null,
          description text not null default '',
          link_path text not null default '',
          image_src text not null default '',
          active boolean not null default true,
          sort_order integer not null default 100,
          updated_at timestamptz not null default now()
        )
      `);

      await db.unsafe(`
        create table if not exists collection_items (
          collection_id text not null references collections(id) on delete cascade,
          place_id text not null references places(id) on delete cascade,
          sort_order integer not null default 100,
          primary key (collection_id, place_id)
        )
      `);

      await db.unsafe(`
        create table if not exists home_content (
          id text primary key,
          payload jsonb not null default '{}'::jsonb,
          updated_at timestamptz not null default now()
        )
      `);

      await db.unsafe(`
        create table if not exists support_content (
          id text primary key,
          payload jsonb not null default '{}'::jsonb,
          updated_at timestamptz not null default now()
        )
      `);

      await db.unsafe(`
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

      await db.unsafe(`
        create index if not exists analytics_events_created_at_idx on analytics_events (created_at desc)
      `);

      const categoryRows = await db.unsafe('select id from categories limit 1');
      if (categoryRows.length === 0) {
        await replaceStoreContents(normalizeContentStore(cloneDefaultContent()));
      }

      const supportRows = await db.unsafe('select id from support_content where id = $1 limit 1', ['contacts']);
      if (supportRows.length === 0) {
        await db.unsafe(
          'insert into support_content (id, payload, updated_at) values ($1, $2::jsonb, now())',
          ['contacts', JSON.stringify(cloneDefaultSupportContent())]
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

async function replaceStoreContents(store) {
  const db = getSql();
  if (!db) {
    return setMemoryStore(store);
  }

  const normalized = normalizeContentStore(store);

  await db.begin(async (tx) => {
    const categories = normalized.categories;
    const places = normalized.places;
    const tips = normalized.tips;
    const banners = normalized.banners;
    const collections = normalized.collections;

    if (places.length === 0) {
      await tx.unsafe('delete from place_images');
      await tx.unsafe('delete from places');
    }

    for (const category of categories) {
      await tx.unsafe(
        `
          insert into categories (
            id, title, path, badge, description, visible, show_on_home, slug, short_title, accent, image_src, filter_schema, sort_order, updated_at
          ) values (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, now()
          )
          on conflict (id) do update set
            title = excluded.title,
            path = excluded.path,
            badge = excluded.badge,
            description = excluded.description,
            visible = excluded.visible,
            show_on_home = excluded.show_on_home,
            slug = excluded.slug,
            short_title = excluded.short_title,
            accent = excluded.accent,
            image_src = excluded.image_src,
            filter_schema = excluded.filter_schema,
            sort_order = excluded.sort_order,
            updated_at = now()
        `,
        [
          category.id,
          category.title,
          category.path,
          category.badge || '',
          category.description || '',
          category.visible,
          category.showOnHome,
          category.slug,
          category.shortTitle,
          category.accent,
          category.imageSrc || '',
          JSON.stringify(category.filterSchema || {}),
          Number(category.sortOrder || 100)
        ]
      );
    }

    if (categories.length > 0) {
      await tx.unsafe('delete from categories where id <> all($1::text[])', [categories.map((item) => item.id)]);
    }

    for (const place of places) {
      await tx.unsafe(
        `
          insert into places (
            id, category_id, slug, title, description, address, phone, website, hours, avg_check, kind, cuisine,
            services, tags, breakfast, vegan, pets, child_programs, top, rating, image_label, image_src,
            status, sort_order, lat, lng, map_query, district, updated_at
          ) values (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
            $13::jsonb, $14::jsonb, $15, $16, $17, $18, $19, $20, $21, $22,
            $23, $24, $25, $26, $27, $28, now()
          )
          on conflict (id) do update set
            category_id = excluded.category_id,
            slug = excluded.slug,
            title = excluded.title,
            description = excluded.description,
            address = excluded.address,
            phone = excluded.phone,
            website = excluded.website,
            hours = excluded.hours,
            avg_check = excluded.avg_check,
            kind = excluded.kind,
            cuisine = excluded.cuisine,
            services = excluded.services,
            tags = excluded.tags,
            breakfast = excluded.breakfast,
            vegan = excluded.vegan,
            pets = excluded.pets,
            child_programs = excluded.child_programs,
            top = excluded.top,
            rating = excluded.rating,
            image_label = excluded.image_label,
            image_src = excluded.image_src,
            status = excluded.status,
            sort_order = excluded.sort_order,
            lat = excluded.lat,
            lng = excluded.lng,
            map_query = excluded.map_query,
            district = excluded.district,
            updated_at = now()
        `,
        [
          place.id,
          place.categoryId,
          place.slug,
          place.title,
          place.description,
          place.address,
          place.phone,
          place.website,
          place.hours,
          place.avgCheck,
          place.kind,
          place.cuisine,
          JSON.stringify(place.services || []),
          JSON.stringify(place.tags || []),
          place.breakfast,
          place.vegan,
          place.pets,
          place.childPrograms,
          place.top,
          place.rating || 0,
          place.imageLabel || '',
          place.imageSrc || '',
          coerceStatus(place.status),
          Number(place.sortOrder || 100),
          toNullableNumber(place.lat),
          toNullableNumber(place.lng),
          place.mapQuery || place.address || '',
          place.district || ''
        ]
      );

      await tx.unsafe('delete from place_images where place_id = $1', [place.id]);

      const gallery = normalizeStringArray(place.imageGallery || place.imageUrls);
      const finalGallery = gallery.length ? gallery : place.imageSrc ? [place.imageSrc] : [];
      for (const [imageIndex, imageUrl] of finalGallery.entries()) {
        await tx.unsafe(
          `
            insert into place_images (id, place_id, image_url, sort_order, is_cover)
            values ($1, $2, $3, $4, $5)
            on conflict (id) do update set
              place_id = excluded.place_id,
              image_url = excluded.image_url,
              sort_order = excluded.sort_order,
              is_cover = excluded.is_cover
          `,
          [`${place.id}:${imageIndex + 1}`, place.id, imageUrl, imageIndex * 10 + 10, imageIndex === 0]
        );
      }
    }

    if (places.length > 0) {
      await tx.unsafe('delete from places where id <> all($1::text[])', [places.map((item) => item.id)]);
    }

    for (const tip of tips) {
      await tx.unsafe(
        `
          insert into tips (id, title, text, link_path, active, sort_order, updated_at)
          values ($1, $2, $3, $4, $5, $6, now())
          on conflict (id) do update set
            title = excluded.title,
            text = excluded.text,
            link_path = excluded.link_path,
            active = excluded.active,
            sort_order = excluded.sort_order,
            updated_at = now()
        `,
        [tip.id, tip.title, tip.text || '', tip.linkPath || '', tip.active, Number(tip.sortOrder || 100)]
      );
    }
    if (tips.length > 0) {
      await tx.unsafe('delete from tips where id <> all($1::text[])', [tips.map((item) => item.id)]);
    }

    for (const banner of banners) {
      await tx.unsafe(
        `
          insert into banners (id, title, subtitle, link_path, tone, image_src, active, sort_order, updated_at)
          values ($1, $2, $3, $4, $5, $6, $7, $8, now())
          on conflict (id) do update set
            title = excluded.title,
            subtitle = excluded.subtitle,
            link_path = excluded.link_path,
            tone = excluded.tone,
            image_src = excluded.image_src,
            active = excluded.active,
            sort_order = excluded.sort_order,
            updated_at = now()
        `,
        [banner.id, banner.title, banner.subtitle || '', banner.linkPath || '', banner.tone || 'coast', banner.imageSrc || '', banner.active, Number(banner.sortOrder || 100)]
      );
    }
    if (banners.length > 0) {
      await tx.unsafe('delete from banners where id <> all($1::text[])', [banners.map((item) => item.id)]);
    }

    for (const collection of collections) {
      await tx.unsafe(
        `
          insert into collections (id, title, description, link_path, image_src, active, sort_order, updated_at)
          values ($1, $2, $3, $4, $5, $6, $7, now())
          on conflict (id) do update set
            title = excluded.title,
            description = excluded.description,
            link_path = excluded.link_path,
            image_src = excluded.image_src,
            active = excluded.active,
            sort_order = excluded.sort_order,
            updated_at = now()
        `,
        [collection.id, collection.title, collection.description || '', collection.linkPath || '', collection.imageSrc || '', collection.active, Number(collection.sortOrder || 100)]
      );

      await tx.unsafe('delete from collection_items where collection_id = $1', [collection.id]);
      for (const [itemIndex, placeId] of collection.itemIds.entries()) {
        await tx.unsafe(
          `
            insert into collection_items (collection_id, place_id, sort_order)
            values ($1, $2, $3)
            on conflict (collection_id, place_id) do update set sort_order = excluded.sort_order
          `,
          [collection.id, placeId, itemIndex * 10 + 10]
        );
      }
    }
    if (collections.length > 0) {
      await tx.unsafe('delete from collections where id <> all($1::text[])', [collections.map((item) => item.id)]);
    }

    await tx.unsafe(
      `
        insert into home_content (id, payload, updated_at)
        values ('main', $1::jsonb, now())
        on conflict (id) do update set payload = excluded.payload, updated_at = now()
      `,
      [JSON.stringify(normalized.home)]
    );
  });

  const analyticsEvents = await getAnalyticsEvents(400);
  return normalizeContentStore({ ...normalized, analytics: { events: analyticsEvents } });
}

async function readCategories() {
  const db = getSql();
  if (!db) {
    return getMemoryStore().categories;
  }

  await ensureDatabase();
  const rows = await db.unsafe(`
    select id, title, path, badge, description, visible, show_on_home as "showOnHome", slug,
           short_title as "shortTitle", accent, image_src as "imageSrc", filter_schema as "filterSchema", sort_order as "sortOrder"
    from categories
    order by sort_order asc, title asc
  `);

  const fallbackMap = new Map(cloneDefaultContent().categories.map((item) => [item.id, item]));
  return rows.map((row, index) => normalizeCategory(row, index, fallbackMap));
}

async function readPlaces() {
  const db = getSql();
  if (!db) {
    return getMemoryStore().places;
  }

  await ensureDatabase();
  const [placeRows, imageRows] = await Promise.all([
    db.unsafe(`
      select id, category_id as "categoryId", slug, title, description, address, phone, website, hours,
             avg_check as "avgCheck", kind, cuisine, services, tags, breakfast, vegan, pets,
             child_programs as "childPrograms", top, rating, image_label as "imageLabel", image_src as "imageSrc",
             status, sort_order as "sortOrder", lat, lng, map_query as "mapQuery", district
      from places
      order by sort_order asc, title asc
    `),
    db.unsafe(`
      select place_id as "placeId", image_url as "imageUrl", sort_order as "sortOrder", is_cover as "isCover"
      from place_images
      order by place_id asc, sort_order asc
    `)
  ]);

  const imagesByPlaceId = new Map();
  for (const row of imageRows) {
    const bucket = imagesByPlaceId.get(row.placeId) || [];
    bucket.push(row);
    imagesByPlaceId.set(row.placeId, bucket);
  }

  return placeRows.map((row, index) => {
    const images = (imagesByPlaceId.get(row.id) || []).map((item) => item.imageUrl);
    const cover = (imagesByPlaceId.get(row.id) || []).find((item) => item.isCover)?.imageUrl || row.imageSrc || images[0] || '';
    return normalizePlace(
      {
        ...row,
        imageGallery: images,
        imageUrls: images,
        coverImageUrl: cover,
        imageSrc: cover,
        categorySlug: row.categoryId,
        featured: row.top,
        childFriendly: row.childPrograms,
        petFriendly: row.pets,
        shortDescription: row.description,
        priceLabel: typeof row.avgCheck === 'number' ? `от ${row.avgCheck}` : '',
        listingType: row.kind,
        location: row.address,
        phoneNumber: row.phone,
        websiteUrl: row.website,
        type: row.kind,
        visible: row.status !== 'hidden'
      },
      index
    );
  });
}

async function readTips() {
  const db = getSql();
  if (!db) {
    return getMemoryStore().tips;
  }

  await ensureDatabase();
  const rows = await db.unsafe(`
    select id, title, text, link_path as "linkPath", active, sort_order as "sortOrder"
    from tips
    order by sort_order asc, title asc
  `);
  return rows.map(normalizeTip);
}

async function readBanners() {
  const db = getSql();
  if (!db) {
    return getMemoryStore().banners;
  }

  await ensureDatabase();
  const rows = await db.unsafe(`
    select id, title, subtitle, link_path as "linkPath", tone, image_src as "imageSrc", active, sort_order as "sortOrder"
    from banners
    order by sort_order asc, title asc
  `);
  return rows.map(normalizeBanner);
}

async function readCollections() {
  const db = getSql();
  if (!db) {
    return getMemoryStore().collections;
  }

  await ensureDatabase();
  const [collectionRows, itemRows] = await Promise.all([
    db.unsafe(`
      select id, title, description, link_path as "linkPath", image_src as "imageSrc", active, sort_order as "sortOrder"
      from collections
      order by sort_order asc, title asc
    `),
    db.unsafe(`
      select collection_id as "collectionId", place_id as "placeId", sort_order as "sortOrder"
      from collection_items
      order by collection_id asc, sort_order asc
    `)
  ]);

  const itemsByCollection = new Map();
  for (const row of itemRows) {
    const bucket = itemsByCollection.get(row.collectionId) || [];
    bucket.push(row.placeId);
    itemsByCollection.set(row.collectionId, bucket);
  }

  return collectionRows.map((row, index) => normalizeCollection({ ...row, itemIds: itemsByCollection.get(row.id) || [] }, index));
}

async function readHomeContent() {
  const db = getSql();
  if (!db) {
    return getMemoryStore().home;
  }

  await ensureDatabase();
  const rows = await db.unsafe('select payload from home_content where id = $1 limit 1', ['main']);
  return normalizeContentStore({ home: rows[0]?.payload || cloneDefaultContent().home }).home;
}

async function getAnalyticsEvents(limit = 400) {
  const db = getSql();
  if (!db) {
    return getMemoryStore().analytics.events.slice(-limit);
  }

  await ensureDatabase();

  const rows = await db.unsafe(
    `
      select
        id,
        kind,
        label,
        path,
        entity_id as "entityId",
        category_id as "categoryId",
        created_at as "createdAt"
      from analytics_events
      order by created_at desc
      limit $1
    `,
    [limit]
  );

  return rows.reverse();
}

async function readSupportContent() {
  const db = getSql();
  if (!db) {
    return getMemorySupportContent();
  }

  await ensureDatabase();
  const rows = await db.unsafe('select payload from support_content where id = $1 limit 1', ['contacts']);
  return normalizeSupportContent(rows[0]?.payload || cloneDefaultSupportContent());
}

async function saveSupportContent(contentInput) {
  const normalized = normalizeSupportContent(contentInput);
  const db = getSql();
  if (!db) {
    return setMemorySupportContent(normalized);
  }

  await ensureDatabase();
  await db.unsafe(
    `
      insert into support_content (id, payload, updated_at)
      values ('contacts', $1::jsonb, now())
      on conflict (id) do update set payload = excluded.payload, updated_at = now()
    `,
    [JSON.stringify(normalized)]
  );

  return readSupportContent();
}

async function getContentStore() {
  const db = getSql();
  if (!db) {
    return getMemoryStore();
  }

  await ensureDatabase();

  const [categories, places, tips, banners, collections, home, analyticsEvents] = await Promise.all([
    readCategories(),
    readPlaces(),
    readTips(),
    readBanners(),
    readCollections(),
    readHomeContent(),
    getAnalyticsEvents(400)
  ]);

  return normalizeContentStore({
    categories,
    places,
    tips,
    banners,
    collections,
    home,
    analytics: {
      events: analyticsEvents
    }
  });
}

async function saveContentStore(store) {
  if (!getSql()) {
    return setMemoryStore(store);
  }

  await ensureDatabase();
  return replaceStoreContents(store);
}

async function resetContentStore() {
  const seed = normalizeContentStore(cloneDefaultContent());
  seed.analytics = { events: [] };

  const db = getSql();
  if (!db) {
    return setMemoryStore(seed);
  }

  await ensureDatabase();
  await db.unsafe('delete from analytics_events');
  return replaceStoreContents(seed);
}

async function appendAnalyticsEvent(event) {
  const db = getSql();
  if (!db) {
    const store = getMemoryStore();
    store.analytics.events = [...store.analytics.events, event].slice(-400);
    setMemoryStore(store);
    return event;
  }

  await ensureDatabase();

  await db.unsafe(
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


async function getCategories() {
  return readCategories();
}

async function getCategoryById(id) {
  const categories = await readCategories();
  return categories.find((category) => category.id === id) || null;
}

async function getCategoryBySlug(slug) {
  const categories = await readCategories();
  return categories.find((category) => category.slug === slug || category.id === slug) || null;
}

async function getPlaces(options = {}) {
  const store = await getContentStore();
  const { categoryId, includeHidden = false, search = '' } = options;
  const normalizedSearch = String(search || '').trim().toLowerCase();

  return store.places.filter((place) => {
    if (categoryId && place.categoryId !== categoryId && place.categorySlug !== categoryId) {
      return false;
    }
    if (!includeHidden && place.status !== 'published') {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    const haystack = [
      place.title,
      place.description,
      place.address,
      place.kind,
      place.cuisine,
      ...(place.tags || []),
      ...(place.services || [])
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  });
}

async function getPlaceById(id) {
  const places = await readPlaces();
  return places.find((place) => place.id === id) || null;
}

async function getPlaceBySlug(slug) {
  const places = await readPlaces();
  return places.find((place) => place.slug === slug || place.id === slug) || null;
}

async function saveHomeContent(homeInput) {
  const normalizedHome = normalizeContentStore({ home: homeInput }).home;
  const db = getSql();
  if (!db) {
    const store = getMemoryStore();
    return setMemoryStore({ ...store, home: normalizedHome }).home;
  }

  await ensureDatabase();
  await db.unsafe(
    `
      insert into home_content (id, payload, updated_at)
      values ('main', $1::jsonb, now())
      on conflict (id) do update set payload = excluded.payload, updated_at = now()
    `,
    [JSON.stringify(normalizedHome)]
  );

  return readHomeContent();
}

async function upsertCategory(incomingCategory) {
  const categories = await readCategories();
  const fallbackMap = new Map(cloneDefaultContent().categories.map((item) => [item.id, item]));
  const current = categories.find((category) => category.id === incomingCategory?.id || category.slug === incomingCategory?.slug) || undefined;
  const normalizedCategory = normalizeCategory(
    {
      ...current,
      ...incomingCategory,
      id: String(incomingCategory?.id || current?.id || slugify(incomingCategory?.slug || incomingCategory?.title || 'category')).trim(),
      slug: String(incomingCategory?.slug || incomingCategory?.id || current?.slug || slugify(incomingCategory?.title || 'category')).trim(),
      path: String(incomingCategory?.path || current?.path || `/section/${incomingCategory?.slug || incomingCategory?.id || slugify(incomingCategory?.title || 'category')}`).trim(),
      visible: incomingCategory?.visible ?? current?.visible ?? true,
      showOnHome: incomingCategory?.showOnHome ?? current?.showOnHome ?? false,
      filterSchema: {
        quickFilters: normalizeStringArray(incomingCategory?.filterSchema?.quickFilters ?? current?.filterSchema?.quickFilters),
        fields: normalizeStringArray(incomingCategory?.filterSchema?.fields ?? current?.filterSchema?.fields)
      }
    },
    categories.length,
    fallbackMap
  );

  const db = getSql();
  if (!db) {
    const store = getMemoryStore();
    const nextStore = setMemoryStore({
      ...store,
      categories: [normalizedCategory, ...store.categories.filter((item) => item.id !== normalizedCategory.id)]
    });
    return nextStore.categories.find((item) => item.id === normalizedCategory.id) || normalizedCategory;
  }

  await ensureDatabase();
  await db.unsafe(
    `
      insert into categories (
        id, title, path, badge, description, visible, show_on_home, slug, short_title, accent, image_src, filter_schema, sort_order, updated_at
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, now()
      )
      on conflict (id) do update set
        title = excluded.title,
        path = excluded.path,
        badge = excluded.badge,
        description = excluded.description,
        visible = excluded.visible,
        show_on_home = excluded.show_on_home,
        slug = excluded.slug,
        short_title = excluded.short_title,
        accent = excluded.accent,
        image_src = excluded.image_src,
        filter_schema = excluded.filter_schema,
        sort_order = excluded.sort_order,
        updated_at = now()
    `,
    [
      normalizedCategory.id,
      normalizedCategory.title,
      normalizedCategory.path,
      normalizedCategory.badge || '',
      normalizedCategory.description || '',
      normalizedCategory.visible,
      normalizedCategory.showOnHome,
      normalizedCategory.slug,
      normalizedCategory.shortTitle,
      normalizedCategory.accent,
      normalizedCategory.imageSrc || '',
      JSON.stringify(normalizedCategory.filterSchema || {}),
      Number(normalizedCategory.sortOrder || 100)
    ]
  );

  return getCategoryById(normalizedCategory.id);
}

async function deleteCategory(categoryId) {
  const db = getSql();
  if (!db) {
    const store = getMemoryStore();
    const removedPlaceIds = store.places.filter((place) => place.categoryId === categoryId).map((place) => place.id);
    return setMemoryStore({
      ...store,
      categories: store.categories.filter((category) => category.id !== categoryId),
      places: store.places.filter((place) => place.categoryId !== categoryId),
      collections: store.collections.map((collection) => ({
        ...collection,
        itemIds: collection.itemIds.filter((itemId) => !removedPlaceIds.includes(itemId))
      })),
      home: {
        ...store.home,
        featuredCategoryIds: store.home.featuredCategoryIds.filter((itemId) => itemId !== categoryId),
        popularPlaceIds: store.home.popularPlaceIds.filter((itemId) => !removedPlaceIds.includes(itemId))
      }
    });
  }

  await ensureDatabase();
  const placeRows = await db.unsafe('select id from places where category_id = $1', [categoryId]);
  const removedPlaceIds = placeRows.map((row) => row.id);
  await db.begin(async (tx) => {
    await tx.unsafe('delete from categories where id = $1', [categoryId]);

    const homeRows = await tx.unsafe('select payload from home_content where id = $1 limit 1', ['main']);
    const currentHome = normalizeContentStore({ home: homeRows[0]?.payload || cloneDefaultContent().home }).home;
    const nextHome = {
      ...currentHome,
      featuredCategoryIds: currentHome.featuredCategoryIds.filter((itemId) => itemId !== categoryId),
      popularPlaceIds: currentHome.popularPlaceIds.filter((itemId) => !removedPlaceIds.includes(itemId))
    };
    await tx.unsafe(
      `
        insert into home_content (id, payload, updated_at)
        values ('main', $1::jsonb, now())
        on conflict (id) do update set payload = excluded.payload, updated_at = now()
      `,
      [JSON.stringify(nextHome)]
    );
  });

  return getCategories();
}

async function saveTips(items) {
  const normalizedItems = (Array.isArray(items) ? items : []).map((item, index) => normalizeTip(item, index));
  const db = getSql();
  if (!db) {
    const store = getMemoryStore();
    return setMemoryStore({ ...store, tips: normalizedItems }).tips;
  }

  await ensureDatabase();
  await db.begin(async (tx) => {
    if (normalizedItems.length === 0) {
      await tx.unsafe('delete from tips');
      return;
    }

    for (const tip of normalizedItems) {
      await tx.unsafe(
        `
          insert into tips (id, title, text, link_path, active, sort_order, updated_at)
          values ($1, $2, $3, $4, $5, $6, now())
          on conflict (id) do update set
            title = excluded.title,
            text = excluded.text,
            link_path = excluded.link_path,
            active = excluded.active,
            sort_order = excluded.sort_order,
            updated_at = now()
        `,
        [tip.id, tip.title, tip.text || '', tip.linkPath || '', tip.active, Number(tip.sortOrder || 100)]
      );
    }

    await tx.unsafe('delete from tips where id <> all($1::text[])', [normalizedItems.map((item) => item.id)]);
  });

  return readTips();
}

async function saveBanners(items) {
  const normalizedItems = (Array.isArray(items) ? items : []).map((item, index) => normalizeBanner(item, index));
  const db = getSql();
  if (!db) {
    const store = getMemoryStore();
    return setMemoryStore({ ...store, banners: normalizedItems }).banners;
  }

  await ensureDatabase();
  await db.begin(async (tx) => {
    if (normalizedItems.length === 0) {
      await tx.unsafe('delete from banners');
      return;
    }

    for (const banner of normalizedItems) {
      await tx.unsafe(
        `
          insert into banners (id, title, subtitle, link_path, tone, image_src, active, sort_order, updated_at)
          values ($1, $2, $3, $4, $5, $6, $7, $8, now())
          on conflict (id) do update set
            title = excluded.title,
            subtitle = excluded.subtitle,
            link_path = excluded.link_path,
            tone = excluded.tone,
            image_src = excluded.image_src,
            active = excluded.active,
            sort_order = excluded.sort_order,
            updated_at = now()
        `,
        [banner.id, banner.title, banner.subtitle || '', banner.linkPath || '', banner.tone || 'coast', banner.imageSrc || '', banner.active, Number(banner.sortOrder || 100)]
      );
    }

    await tx.unsafe('delete from banners where id <> all($1::text[])', [normalizedItems.map((item) => item.id)]);
  });

  return readBanners();
}

async function saveCollections(items) {
  const normalizedItems = (Array.isArray(items) ? items : []).map((item, index) => normalizeCollection(item, index));
  const db = getSql();
  if (!db) {
    const store = getMemoryStore();
    return setMemoryStore({ ...store, collections: normalizedItems }).collections;
  }

  await ensureDatabase();
  await db.begin(async (tx) => {
    if (normalizedItems.length === 0) {
      await tx.unsafe('delete from collection_items');
      await tx.unsafe('delete from collections');
      return;
    }

    for (const collection of normalizedItems) {
      await tx.unsafe(
        `
          insert into collections (id, title, description, link_path, image_src, active, sort_order, updated_at)
          values ($1, $2, $3, $4, $5, $6, $7, now())
          on conflict (id) do update set
            title = excluded.title,
            description = excluded.description,
            link_path = excluded.link_path,
            image_src = excluded.image_src,
            active = excluded.active,
            sort_order = excluded.sort_order,
            updated_at = now()
        `,
        [collection.id, collection.title, collection.description || '', collection.linkPath || '', collection.imageSrc || '', collection.active, Number(collection.sortOrder || 100)]
      );

      await tx.unsafe('delete from collection_items where collection_id = $1', [collection.id]);
      for (const [itemIndex, placeId] of collection.itemIds.entries()) {
        await tx.unsafe(
          `
            insert into collection_items (collection_id, place_id, sort_order)
            values ($1, $2, $3)
            on conflict (collection_id, place_id) do update set sort_order = excluded.sort_order
          `,
          [collection.id, placeId, itemIndex * 10 + 10]
        );
      }
    }

    await tx.unsafe('delete from collections where id <> all($1::text[])', [normalizedItems.map((item) => item.id)]);
  });

  return readCollections();
}

async function updateCollectionItems(collectionIdOrSlug, itemIds) {
  const collections = await readCollections();
  const current = collections.find((collection) => collection.id === collectionIdOrSlug || collection.linkPath === collectionIdOrSlug);
  if (!current) {
    return null;
  }

  const nextCollections = collections.map((collection) =>
    collection.id === current.id
      ? { ...collection, itemIds: normalizeStringArray(itemIds) }
      : collection
  );

  await saveCollections(nextCollections);
  return (await readCollections()).find((collection) => collection.id === current.id) || null;
}

async function upsertPlace(incomingPlace) {
  const current = incomingPlace?.id ? await getPlaceById(incomingPlace.id) : null;
  const normalizedPlace = normalizePlace(incomingPlace, 0, current || undefined);
  const db = getSql();
  if (!db) {
    const store = getMemoryStore();
    const nextStore = setMemoryStore({
      ...store,
      places: [normalizedPlace, ...store.places.filter((place) => place.id !== normalizedPlace.id)]
    });
    return nextStore.places.find((place) => place.id === normalizedPlace.id) || normalizedPlace;
  }

  await ensureDatabase();
  await db.begin(async (tx) => {
    await tx.unsafe(
      `
        insert into places (
          id, category_id, slug, title, description, address, phone, website, hours, avg_check, kind, cuisine,
          services, tags, breakfast, vegan, pets, child_programs, top, rating, image_label, image_src,
          status, sort_order, lat, lng, map_query, district, updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          $13::jsonb, $14::jsonb, $15, $16, $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28, now()
        )
        on conflict (id) do update set
          category_id = excluded.category_id,
          slug = excluded.slug,
          title = excluded.title,
          description = excluded.description,
          address = excluded.address,
          phone = excluded.phone,
          website = excluded.website,
          hours = excluded.hours,
          avg_check = excluded.avg_check,
          kind = excluded.kind,
          cuisine = excluded.cuisine,
          services = excluded.services,
          tags = excluded.tags,
          breakfast = excluded.breakfast,
          vegan = excluded.vegan,
          pets = excluded.pets,
          child_programs = excluded.child_programs,
          top = excluded.top,
          rating = excluded.rating,
          image_label = excluded.image_label,
          image_src = excluded.image_src,
          status = excluded.status,
          sort_order = excluded.sort_order,
          lat = excluded.lat,
          lng = excluded.lng,
          map_query = excluded.map_query,
          district = excluded.district,
          updated_at = now()
      `,
      [
        normalizedPlace.id,
        normalizedPlace.categoryId,
        normalizedPlace.slug,
        normalizedPlace.title,
        normalizedPlace.description,
        normalizedPlace.address,
        normalizedPlace.phone,
        normalizedPlace.website,
        normalizedPlace.hours,
        normalizedPlace.avgCheck,
        normalizedPlace.kind,
        normalizedPlace.cuisine,
        JSON.stringify(normalizedPlace.services || []),
        JSON.stringify(normalizedPlace.tags || []),
        normalizedPlace.breakfast,
        normalizedPlace.vegan,
        normalizedPlace.pets,
        normalizedPlace.childPrograms,
        normalizedPlace.top,
        normalizedPlace.rating || 0,
        normalizedPlace.imageLabel || '',
        normalizedPlace.imageSrc || '',
        coerceStatus(normalizedPlace.status),
        Number(normalizedPlace.sortOrder || 100),
        toNullableNumber(normalizedPlace.lat),
        toNullableNumber(normalizedPlace.lng),
        normalizedPlace.mapQuery || normalizedPlace.address || '',
        normalizedPlace.district || ''
      ]
    );

    await tx.unsafe('delete from place_images where place_id = $1', [normalizedPlace.id]);

    const gallery = normalizeStringArray(normalizedPlace.imageGallery || normalizedPlace.imageUrls);
    const finalGallery = gallery.length ? gallery : normalizedPlace.imageSrc ? [normalizedPlace.imageSrc] : [];
    for (const [imageIndex, imageUrl] of finalGallery.entries()) {
      await tx.unsafe(
        `
          insert into place_images (id, place_id, image_url, sort_order, is_cover)
          values ($1, $2, $3, $4, $5)
          on conflict (id) do update set
            place_id = excluded.place_id,
            image_url = excluded.image_url,
            sort_order = excluded.sort_order,
            is_cover = excluded.is_cover
        `,
        [`${normalizedPlace.id}:${imageIndex + 1}`, normalizedPlace.id, imageUrl, imageIndex * 10 + 10, imageIndex === 0]
      );
    }
  });

  return getPlaceById(normalizedPlace.id);
}

async function deletePlace(id) {
  const db = getSql();
  if (!db) {
    const store = getMemoryStore();
    return setMemoryStore({
      ...store,
      places: store.places.filter((place) => place.id !== id),
      home: {
        ...store.home,
        popularPlaceIds: store.home.popularPlaceIds.filter((itemId) => itemId !== id)
      },
      collections: store.collections.map((collection) => ({
        ...collection,
        itemIds: collection.itemIds.filter((itemId) => itemId !== id)
      }))
    });
  }

  await ensureDatabase();
  await db.begin(async (tx) => {
    await tx.unsafe('delete from places where id = $1', [id]);
    await tx.unsafe('delete from collection_items where place_id = $1', [id]);

    const homeRows = await tx.unsafe('select payload from home_content where id = $1 limit 1', ['main']);
    const currentHome = normalizeContentStore({ home: homeRows[0]?.payload || cloneDefaultContent().home }).home;
    const nextHome = {
      ...currentHome,
      popularPlaceIds: currentHome.popularPlaceIds.filter((itemId) => itemId !== id)
    };

    await tx.unsafe(
      `
        insert into home_content (id, payload, updated_at)
        values ('main', $1::jsonb, now())
        on conflict (id) do update set payload = excluded.payload, updated_at = now()
      `,
      [JSON.stringify(nextHome)]
    );
  });

  return getContentStore();
}


async function getMediaFiles(limit = 120) {
  const db = getSql();
  if (!db) {
    return [];
  }

  await ensureDatabase();
  return db.unsafe(
    `
      select id, kind, file_name as "fileName", mime_type as "mimeType", size_bytes as "sizeBytes",
             storage_path as "storagePath", public_url as "publicUrl", created_at as "createdAt"
      from media_files
      order by created_at desc
      limit $1
    `,
    [limit]
  );
}

async function deleteMediaFileRecord(id) {
  const db = getSql();
  if (!db) {
    return null;
  }

  await ensureDatabase();
  const rows = await db.unsafe(
    `delete from media_files where id = $1 returning id, kind, file_name as "fileName", mime_type as "mimeType", size_bytes as "sizeBytes", storage_path as "storagePath", public_url as "publicUrl", created_at as "createdAt"`,
    [id]
  );
  return rows[0] || null;
}

async function saveMediaFileRecord(input) {
  const db = getSql();
  const record = {
    id: String(input?.id || crypto.randomUUID()),
    kind: String(input?.kind || 'general'),
    fileName: String(input?.fileName || ''),
    mimeType: String(input?.mimeType || ''),
    sizeBytes: Number(input?.sizeBytes || 0) || 0,
    storagePath: String(input?.storagePath || ''),
    publicUrl: String(input?.publicUrl || '')
  };

  if (!db) {
    return record;
  }

  await ensureDatabase();
  await db.unsafe(
    `
      insert into media_files (id, kind, file_name, mime_type, size_bytes, storage_path, public_url)
      values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (id) do update set
        kind = excluded.kind,
        file_name = excluded.file_name,
        mime_type = excluded.mime_type,
        size_bytes = excluded.size_bytes,
        storage_path = excluded.storage_path,
        public_url = excluded.public_url
    `,
    [
      record.id,
      record.kind,
      record.fileName,
      record.mimeType,
      record.sizeBytes,
      record.storagePath,
      record.publicUrl
    ]
  );

  return record;
}


module.exports = {
  appendAnalyticsEvent,
  cloneDefaultContent,
  deleteCategory,
  deleteMediaFileRecord,
  deletePlace,
  ensureDatabase,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  getContentStore,
  getPlaceById,
  getPlaceBySlug,
  getPlaces,
  getMediaFiles,
  getSql,
  hasDatabase,
  normalizeContentStore,
  normalizePlace,
  resetContentStore,
  saveBanners,
  saveCollections,
  saveContentStore,
  saveHomeContent,
  saveTips,
  updateCollectionItems,
  saveMediaFileRecord,
  saveSupportContent,
  readSupportContent,
  upsertCategory,
  upsertPlace
};
