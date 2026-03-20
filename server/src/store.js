const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const { Pool } = require('pg');
const { buildSeed } = require('./seed');

const DATABASE_URL = process.env.DATABASE_URL;
const hasDatabase = Boolean(DATABASE_URL);

function normalizeJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value.split(',').map((item) => item.trim()).filter(Boolean);
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function normalizeCollectionItem(item) {
  return {
    id: item.id,
    collectionSlug: item.collection_slug || item.collectionSlug,
    itemType: item.item_type || item.itemType,
    listingSlug: item.listing_slug || item.listingSlug || null,
    categorySlug: item.category_slug || item.categorySlug || null,
    title: item.title || '',
    description: item.description || '',
    path: item.path || null,
    imageUrl: item.image_url || item.imageUrl || null,
    icon: item.icon || null,
    sortOrder: Number(item.sort_order ?? item.sortOrder ?? 0)
  };
}

function normalizeBanner(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    badge: row.badge || '',
    imageUrl: row.image_url || row.imageUrl || '',
    linkPath: row.link_path || row.linkPath || '/',
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    isActive: typeof row.is_active === 'boolean' ? row.is_active : Boolean(row.isActive)
  };
}

function normalizeCategory(row) {
  return {
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title || row.shortTitle || row.title,
    description: row.description || '',
    icon: row.icon || '✨',
    coverImageUrl: row.cover_image_url || row.coverImageUrl || '/danang-clean-poster.png',
    accent: row.accent || 'orange',
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    isActive: typeof row.is_active === 'boolean' ? row.is_active : Boolean(row.isActive),
    filterSchema: row.filter_schema || row.filterSchema || []
  };
}

function normalizeListing(row) {
  return {
    id: row.id,
    slug: row.slug,
    categorySlug: row.category_slug || row.categorySlug,
    title: row.title,
    shortDescription: row.short_description || row.shortDescription || '',
    description: row.description || '',
    address: row.address || '',
    phone: row.phone || '',
    website: row.website || '',
    hours: row.hours || '',
    mapQuery: row.map_query || row.mapQuery || row.address || row.title,
    averagePrice: row.average_price ?? row.averagePrice ?? null,
    priceLabel: row.price_label || row.priceLabel || '',
    rating: Number(row.rating ?? 0),
    listingType: row.listing_type || row.listingType || '',
    cuisine: row.cuisine || '',
    services: normalizeJsonArray(row.services),
    tags: normalizeJsonArray(row.tags),
    features: normalizeJsonArray(row.features),
    childFriendly: Boolean(row.child_friendly ?? row.childFriendly),
    petFriendly: Boolean(row.pet_friendly ?? row.petFriendly),
    status: row.status || 'draft',
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    featured: Boolean(row.featured),
    imageUrls: normalizeJsonArray(row.image_urls || row.imageUrls),
    extra: row.extra || {},
    createdAt: row.created_at || row.createdAt || null,
    updatedAt: row.updated_at || row.updatedAt || null
  };
}

class MemoryStore {
  constructor() {
    this.reset();
  }

  reset() {
    const seed = buildSeed();
    this.state = {
      categories: seed.categories.map((item) => ({ ...item, isActive: true })),
      filters: seed.filters,
      listings: seed.listings,
      banners: seed.banners,
      collections: seed.collections,
      collectionItems: seed.collectionItems
    };
  }

  async init() {
    return;
  }

  async health() {
    return { mode: 'memory', ready: true };
  }

  async listCategories() {
    return [...this.state.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCategoryBySlug(slug) {
    return this.state.categories.find((item) => item.slug === slug) || null;
  }

  async listFiltersByCategory(categorySlug) {
    return this.state.filters
      .filter((item) => item.categorySlug === categorySlug)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({ ...item }));
  }

  async listCollections() {
    const collections = [...this.state.collections].sort((a, b) => a.sortOrder - b.sortOrder);
    const items = [...this.state.collectionItems].sort((a, b) => a.sortOrder - b.sortOrder);
    return collections.map((collection) => ({
      ...collection,
      items: items.filter((item) => item.collectionSlug === collection.slug)
    }));
  }

  async listBanners() {
    return [...this.state.banners].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async listListings({ categorySlug, status, search }) {
    const q = (search || '').trim().toLowerCase();
    return this.state.listings
      .filter((item) => (categorySlug ? item.categorySlug === categorySlug : true))
      .filter((item) => (status ? item.status === status : true))
      .filter((item) => {
        if (!q) return true;
        const haystack = [item.title, item.shortDescription, item.description, item.tags.join(' '), item.address]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return b.rating - a.rating;
      });
  }

  async getListingBySlug(slug) {
    return this.state.listings.find((item) => item.slug === slug) || null;
  }

  async getSimilarListings(listing) {
    return this.state.listings
      .filter((item) => item.categorySlug === listing.categorySlug && item.id !== listing.id && item.status === 'published')
      .slice(0, 3);
  }

  async upsertListing(input) {
    const normalized = normalizeListing({
      ...input,
      id: input.id || randomUUID(),
      slug: input.slug || `${input.categorySlug}-${randomUUID().slice(0, 8)}`,
      updatedAt: new Date().toISOString(),
      createdAt: input.createdAt || new Date().toISOString()
    });

    const index = this.state.listings.findIndex((item) => item.id === normalized.id);
    if (index >= 0) {
      this.state.listings[index] = normalized;
    } else {
      this.state.listings.push(normalized);
    }

    return normalized;
  }

  async deleteListing(id) {
    this.state.listings = this.state.listings.filter((item) => item.id !== id);
  }

  async replaceCollectionItems(collectionSlug, items) {
    this.state.collectionItems = this.state.collectionItems.filter((item) => item.collectionSlug !== collectionSlug);
    this.state.collectionItems.push(
      ...items.map((item, index) => ({
        id: item.id || randomUUID(),
        collectionSlug,
        itemType: item.itemType,
        listingSlug: item.listingSlug || null,
        categorySlug: item.categorySlug || null,
        title: item.title || '',
        description: item.description || '',
        path: item.path || null,
        imageUrl: item.imageUrl || null,
        icon: item.icon || null,
        sortOrder: item.sortOrder ?? (index + 1) * 10
      }))
    );
  }

  async replaceBanners(items) {
    this.state.banners = items.map((item, index) => ({
      ...item,
      id: item.id || randomUUID(),
      sortOrder: item.sortOrder ?? (index + 1) * 10,
      isActive: item.isActive !== false
    }));
  }
}

class PostgresStore {
  constructor() {
    this.pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
    });
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        short_title TEXT,
        description TEXT,
        icon TEXT,
        cover_image_url TEXT,
        accent TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        filter_schema JSONB NOT NULL DEFAULT '[]'::jsonb
      );

      CREATE TABLE IF NOT EXISTS filters (
        id TEXT PRIMARY KEY,
        category_slug TEXT NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
        filter_key TEXT NOT NULL,
        label TEXT NOT NULL,
        config JSONB NOT NULL DEFAULT '{}'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        category_slug TEXT NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
        title TEXT NOT NULL,
        short_description TEXT,
        description TEXT,
        address TEXT,
        phone TEXT,
        website TEXT,
        hours TEXT,
        map_query TEXT,
        average_price INTEGER,
        price_label TEXT,
        rating NUMERIC(3,2) NOT NULL DEFAULT 0,
        listing_type TEXT,
        cuisine TEXT,
        services JSONB NOT NULL DEFAULT '[]'::jsonb,
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        features JSONB NOT NULL DEFAULT '[]'::jsonb,
        child_friendly BOOLEAN NOT NULL DEFAULT FALSE,
        pet_friendly BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'draft',
        sort_order INTEGER NOT NULL DEFAULT 0,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
        extra JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS banners (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        badge TEXT,
        image_url TEXT,
        link_path TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        subtitle TEXT,
        kind TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS collection_items (
        id TEXT PRIMARY KEY,
        collection_slug TEXT NOT NULL REFERENCES collections(slug) ON DELETE CASCADE,
        item_type TEXT NOT NULL,
        listing_slug TEXT,
        category_slug TEXT,
        title TEXT,
        description TEXT,
        path TEXT,
        image_url TEXT,
        icon TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0
      );
    `);

    const countResult = await this.pool.query('SELECT COUNT(*)::int AS count FROM categories');
    if (countResult.rows[0].count > 0) return;

    const seed = buildSeed();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const category of seed.categories) {
        await client.query(
          `INSERT INTO categories (slug, title, short_title, description, icon, cover_image_url, accent, sort_order, is_active, filter_schema)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            category.slug,
            category.title,
            category.shortTitle,
            category.description,
            category.icon,
            category.coverImageUrl,
            category.accent,
            category.sortOrder,
            true,
            JSON.stringify(category.filterSchema || [])
          ]
        );
      }

      for (const filter of seed.filters) {
        await client.query(
          `INSERT INTO filters (id, category_slug, filter_key, label, config, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [filter.id, filter.categorySlug, filter.filterKey, filter.label, JSON.stringify(filter.config), filter.sortOrder]
        );
      }

      for (const listing of seed.listings) {
        await client.query(
          `INSERT INTO listings (
            id, slug, category_slug, title, short_description, description, address, phone, website,
            hours, map_query, average_price, price_label, rating, listing_type, cuisine,
            services, tags, features, child_friendly, pet_friendly, status, sort_order,
            featured, image_urls, extra
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,
            $10,$11,$12,$13,$14,$15,$16,
            $17,$18,$19,$20,$21,$22,$23,
            $24,$25,$26
          )`,
          [
            listing.id,
            listing.slug,
            listing.categorySlug,
            listing.title,
            listing.shortDescription,
            listing.description,
            listing.address,
            listing.phone,
            listing.website,
            listing.hours,
            listing.mapQuery,
            listing.averagePrice,
            listing.priceLabel,
            listing.rating,
            listing.listingType,
            listing.cuisine,
            JSON.stringify(listing.services),
            JSON.stringify(listing.tags),
            JSON.stringify(listing.features),
            listing.childFriendly,
            listing.petFriendly,
            listing.status,
            listing.sortOrder,
            listing.featured,
            JSON.stringify(listing.imageUrls),
            JSON.stringify(listing.extra)
          ]
        );
      }

      for (const banner of seed.banners) {
        await client.query(
          `INSERT INTO banners (id, title, subtitle, badge, image_url, link_path, sort_order, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [banner.id, banner.title, banner.subtitle, banner.badge, banner.imageUrl, banner.linkPath, banner.sortOrder, banner.isActive]
        );
      }

      for (const collection of seed.collections) {
        await client.query(
          `INSERT INTO collections (id, slug, title, subtitle, kind, sort_order, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [collection.id, collection.slug, collection.title, collection.subtitle, collection.kind, collection.sortOrder, collection.isActive]
        );
      }

      for (const item of seed.collectionItems) {
        await client.query(
          `INSERT INTO collection_items (id, collection_slug, item_type, listing_slug, category_slug, title, description, path, image_url, icon, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [item.id, item.collectionSlug, item.itemType, item.listingSlug || null, item.categorySlug || null, item.title || '', item.description || '', item.path || null, item.imageUrl || null, item.icon || null, item.sortOrder]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async health() {
    await this.pool.query('SELECT 1');
    return { mode: 'postgres', ready: true };
  }

  async listCategories() {
    const result = await this.pool.query('SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order, title');
    return result.rows.map(normalizeCategory);
  }

  async getCategoryBySlug(slug) {
    const result = await this.pool.query('SELECT * FROM categories WHERE slug = $1 LIMIT 1', [slug]);
    return result.rows[0] ? normalizeCategory(result.rows[0]) : null;
  }

  async listFiltersByCategory(categorySlug) {
    const result = await this.pool.query('SELECT * FROM filters WHERE category_slug = $1 ORDER BY sort_order, label', [categorySlug]);
    return result.rows.map((row) => ({
      id: row.id,
      categorySlug: row.category_slug,
      filterKey: row.filter_key,
      label: row.label,
      config: row.config,
      sortOrder: row.sort_order
    }));
  }

  async listCollections() {
    const collectionsResult = await this.pool.query('SELECT * FROM collections WHERE is_active = TRUE ORDER BY sort_order, title');
    const itemsResult = await this.pool.query('SELECT * FROM collection_items ORDER BY sort_order, title');
    const items = itemsResult.rows.map(normalizeCollectionItem);
    return collectionsResult.rows.map((collection) => ({
      id: collection.id,
      slug: collection.slug,
      title: collection.title,
      subtitle: collection.subtitle || '',
      kind: collection.kind,
      sortOrder: collection.sort_order,
      isActive: collection.is_active,
      items: items.filter((item) => item.collectionSlug === collection.slug)
    }));
  }

  async listBanners() {
    const result = await this.pool.query('SELECT * FROM banners WHERE is_active = TRUE ORDER BY sort_order, title');
    return result.rows.map(normalizeBanner);
  }

  async listListings({ categorySlug, status, search }) {
    const values = [];
    const clauses = [];

    if (categorySlug) {
      values.push(categorySlug);
      clauses.push(`category_slug = $${values.length}`);
    }

    if (status) {
      values.push(status);
      clauses.push(`status = $${values.length}`);
    }

    if (search && search.trim()) {
      values.push(`%${search.trim().toLowerCase()}%`);
      clauses.push(`LOWER(CONCAT_WS(' ', title, short_description, description, address, COALESCE(tags::text, ''))) LIKE $${values.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await this.pool.query(
      `SELECT * FROM listings ${where} ORDER BY featured DESC, sort_order ASC, rating DESC, title ASC`,
      values
    );
    return result.rows.map(normalizeListing);
  }

  async getListingBySlug(slug) {
    const result = await this.pool.query('SELECT * FROM listings WHERE slug = $1 LIMIT 1', [slug]);
    return result.rows[0] ? normalizeListing(result.rows[0]) : null;
  }

  async getSimilarListings(listing) {
    const result = await this.pool.query(
      `SELECT * FROM listings
       WHERE category_slug = $1 AND id <> $2 AND status = 'published'
       ORDER BY featured DESC, sort_order ASC, rating DESC
       LIMIT 3`,
      [listing.categorySlug, listing.id]
    );
    return result.rows.map(normalizeListing);
  }

  async upsertListing(input) {
    const payload = normalizeListing({
      ...input,
      id: input.id || randomUUID(),
      slug: input.slug || `${input.categorySlug}-${randomUUID().slice(0, 8)}`
    });

    const result = await this.pool.query(
      `INSERT INTO listings (
        id, slug, category_slug, title, short_description, description, address, phone, website,
        hours, map_query, average_price, price_label, rating, listing_type, cuisine,
        services, tags, features, child_friendly, pet_friendly, status, sort_order,
        featured, image_urls, extra, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16,
        $17,$18,$19,$20,$21,$22,$23,
        $24,$25,$26,NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        category_slug = EXCLUDED.category_slug,
        title = EXCLUDED.title,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        website = EXCLUDED.website,
        hours = EXCLUDED.hours,
        map_query = EXCLUDED.map_query,
        average_price = EXCLUDED.average_price,
        price_label = EXCLUDED.price_label,
        rating = EXCLUDED.rating,
        listing_type = EXCLUDED.listing_type,
        cuisine = EXCLUDED.cuisine,
        services = EXCLUDED.services,
        tags = EXCLUDED.tags,
        features = EXCLUDED.features,
        child_friendly = EXCLUDED.child_friendly,
        pet_friendly = EXCLUDED.pet_friendly,
        status = EXCLUDED.status,
        sort_order = EXCLUDED.sort_order,
        featured = EXCLUDED.featured,
        image_urls = EXCLUDED.image_urls,
        extra = EXCLUDED.extra,
        updated_at = NOW()
      RETURNING *`,
      [
        payload.id,
        payload.slug,
        payload.categorySlug,
        payload.title,
        payload.shortDescription,
        payload.description,
        payload.address,
        payload.phone,
        payload.website,
        payload.hours,
        payload.mapQuery,
        payload.averagePrice,
        payload.priceLabel,
        payload.rating,
        payload.listingType,
        payload.cuisine,
        JSON.stringify(payload.services),
        JSON.stringify(payload.tags),
        JSON.stringify(payload.features),
        payload.childFriendly,
        payload.petFriendly,
        payload.status,
        payload.sortOrder,
        payload.featured,
        JSON.stringify(payload.imageUrls),
        JSON.stringify(payload.extra)
      ]
    );

    return normalizeListing(result.rows[0]);
  }

  async deleteListing(id) {
    await this.pool.query('DELETE FROM listings WHERE id = $1', [id]);
  }

  async replaceCollectionItems(collectionSlug, items) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM collection_items WHERE collection_slug = $1', [collectionSlug]);
      for (const [index, item] of items.entries()) {
        const normalized = normalizeCollectionItem({
          id: item.id || randomUUID(),
          collectionSlug,
          itemType: item.itemType,
          listingSlug: item.listingSlug || null,
          categorySlug: item.categorySlug || null,
          title: item.title || '',
          description: item.description || '',
          path: item.path || null,
          imageUrl: item.imageUrl || null,
          icon: item.icon || null,
          sortOrder: item.sortOrder ?? (index + 1) * 10
        });
        await client.query(
          `INSERT INTO collection_items (id, collection_slug, item_type, listing_slug, category_slug, title, description, path, image_url, icon, sort_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [normalized.id, normalized.collectionSlug, normalized.itemType, normalized.listingSlug, normalized.categorySlug, normalized.title, normalized.description, normalized.path, normalized.imageUrl, normalized.icon, normalized.sortOrder]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async replaceBanners(items) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM banners');
      for (const [index, raw] of items.entries()) {
        const item = normalizeBanner({
          id: raw.id || randomUUID(),
          title: raw.title,
          subtitle: raw.subtitle || '',
          badge: raw.badge || '',
          imageUrl: raw.imageUrl || '',
          linkPath: raw.linkPath || '/',
          sortOrder: raw.sortOrder ?? (index + 1) * 10,
          isActive: raw.isActive !== false
        });
        await client.query(
          `INSERT INTO banners (id, title, subtitle, badge, image_url, link_path, sort_order, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [item.id, item.title, item.subtitle, item.badge, item.imageUrl, item.linkPath, item.sortOrder, item.isActive]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

const store = hasDatabase ? new PostgresStore() : new MemoryStore();

function getUploadsDir() {
  const preferredDir = process.env.UPLOAD_DIR || '/data/uploads';
  const resolvedDir = path.resolve(preferredDir);
  try {
    fs.mkdirSync(resolvedDir, { recursive: true });
    return resolvedDir;
  } catch {
    const fallback = path.resolve(__dirname, '../uploads');
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

module.exports = {
  store,
  hasDatabase,
  getUploadsDir
};
