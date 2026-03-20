const { Pool } = require('pg');
const { defaultCategories, defaultGuideContent } = require('./seed');

function cloneHome(home) {
  return {
    popular: (home?.popular || []).map((item) => ({ ...item })),
    categories: (home?.categories || []).map((item) => ({ ...item })),
    tips: (home?.tips || []).map((item) => ({ ...item }))
  };
}

function createInMemoryState() {
  return {
    categories: defaultCategories.map((item) => ({ ...item })),
    restaurants: defaultGuideContent.restaurants.map((item) => ({ ...item, tags: [...(item.tags || [])] })),
    wellness: defaultGuideContent.wellness.map((item) => ({
      ...item,
      services: [...item.services],
      tags: [...(item.tags || [])]
    })),
    home: cloneHome(defaultGuideContent.home)
  };
}

const memoryState = createInMemoryState();

function shouldUseSsl(connectionString) {
  if (!connectionString) {
    return false;
  }

  return !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeRestaurant(item) {
  return {
    id: String(item?.id || ''),
    title: String(item?.title || '').trim(),
    kind: item?.kind || 'restaurant',
    cuisine: item?.cuisine || 'european',
    breakfast: Boolean(item?.breakfast),
    vegan: Boolean(item?.vegan),
    pets: Boolean(item?.pets),
    avgCheck: Number(item?.avgCheck || 0),
    address: String(item?.address || '').trim(),
    description: String(item?.description || '').trim(),
    rating: Number(item?.rating || 0),
    imageLabel: String(item?.imageLabel || '').trim() || 'Карточка',
    status: item?.status || 'draft',
    sortOrder: Number(item?.sortOrder || 0),
    featured: Boolean(item?.featured),
    phone: String(item?.phone || '').trim(),
    website: String(item?.website || '').trim(),
    hours: String(item?.hours || '').trim(),
    tags: normalizeTags(item?.tags)
  };
}

function normalizeWellness(item) {
  return {
    id: String(item?.id || ''),
    title: String(item?.title || '').trim(),
    services: Array.isArray(item?.services) ? item.services.map((service) => String(service)) : [],
    childPrograms: Boolean(item?.childPrograms),
    address: String(item?.address || '').trim(),
    description: String(item?.description || '').trim(),
    rating: Number(item?.rating || 0),
    imageLabel: String(item?.imageLabel || '').trim() || 'Карточка',
    status: item?.status || 'draft',
    sortOrder: Number(item?.sortOrder || 0),
    featured: Boolean(item?.featured),
    phone: String(item?.phone || '').trim(),
    website: String(item?.website || '').trim(),
    hours: String(item?.hours || '').trim(),
    tags: normalizeTags(item?.tags)
  };
}

function normalizeHomeContent(home) {
  return {
    popular: Array.isArray(home?.popular)
      ? home.popular.map((item, index) => ({
          id: String(item?.id || `popular-${index + 1}`),
          title: String(item?.title || '').trim(),
          description: String(item?.description || '').trim(),
          path: String(item?.path || '/').trim() || '/',
          tone: item?.tone || 'coast'
        }))
      : [],
    categories: Array.isArray(home?.categories)
      ? home.categories.map((item, index) => ({
          id: String(item?.id || `category-${index + 1}`),
          title: String(item?.title || '').trim(),
          subtitle: String(item?.subtitle || '').trim(),
          path: String(item?.path || '/').trim() || '/',
          badge: String(item?.badge || '').trim(),
          tone: item?.tone || 'orange'
        }))
      : [],
    tips: Array.isArray(home?.tips)
      ? home.tips.map((item, index) => ({
          id: String(item?.id || `tip-${index + 1}`),
          title: String(item?.title || '').trim(),
          path: String(item?.path || '/').trim() || '/'
        }))
      : []
  };
}

class GuideStore {
  constructor() {
    this.databaseUrl = process.env.DATABASE_URL || '';
    this.isDatabaseEnabled = Boolean(this.databaseUrl);
    this.pool = this.isDatabaseEnabled
      ? new Pool({
          connectionString: this.databaseUrl,
          ssl: shouldUseSsl(this.databaseUrl) ? { rejectUnauthorized: false } : false
        })
      : null;
  }

  async init() {
    if (!this.pool) {
      console.log('GuideStore: DATABASE_URL not set, using in-memory content store.');
      return;
    }

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS guide_categories (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS guide_restaurants (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        kind TEXT NOT NULL,
        cuisine TEXT NOT NULL,
        breakfast BOOLEAN NOT NULL DEFAULT FALSE,
        vegan BOOLEAN NOT NULL DEFAULT FALSE,
        pets BOOLEAN NOT NULL DEFAULT FALSE,
        avg_check INTEGER NOT NULL DEFAULT 0,
        address TEXT NOT NULL,
        description TEXT NOT NULL,
        rating NUMERIC(3,1) NOT NULL DEFAULT 0,
        image_label TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        sort_order INTEGER NOT NULL DEFAULT 0,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        phone TEXT NOT NULL DEFAULT '',
        website TEXT NOT NULL DEFAULT '',
        hours TEXT NOT NULL DEFAULT '',
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.pool.query(`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';`);
    await this.pool.query(`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;`);
    await this.pool.query(`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;`);
    await this.pool.query(`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';`);
    await this.pool.query(`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS website TEXT NOT NULL DEFAULT '';`);
    await this.pool.query(`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS hours TEXT NOT NULL DEFAULT '';`);
    await this.pool.query(`ALTER TABLE guide_restaurants ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;`);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS guide_wellness (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        services JSONB NOT NULL DEFAULT '[]'::jsonb,
        child_programs BOOLEAN NOT NULL DEFAULT FALSE,
        address TEXT NOT NULL,
        description TEXT NOT NULL,
        rating NUMERIC(3,1) NOT NULL DEFAULT 0,
        image_label TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        sort_order INTEGER NOT NULL DEFAULT 0,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        phone TEXT NOT NULL DEFAULT '',
        website TEXT NOT NULL DEFAULT '',
        hours TEXT NOT NULL DEFAULT '',
        tags JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.pool.query(`ALTER TABLE guide_wellness ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';`);
    await this.pool.query(`ALTER TABLE guide_wellness ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;`);
    await this.pool.query(`ALTER TABLE guide_wellness ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;`);
    await this.pool.query(`ALTER TABLE guide_wellness ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';`);
    await this.pool.query(`ALTER TABLE guide_wellness ADD COLUMN IF NOT EXISTS website TEXT NOT NULL DEFAULT '';`);
    await this.pool.query(`ALTER TABLE guide_wellness ADD COLUMN IF NOT EXISTS hours TEXT NOT NULL DEFAULT '';`);
    await this.pool.query(`ALTER TABLE guide_wellness ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb;`);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS guide_home_content (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const categoriesCount = await this.pool.query('SELECT COUNT(*)::int AS count FROM guide_categories');
    if (categoriesCount.rows[0].count === 0) {
      for (const category of defaultCategories) {
        await this.pool.query(
          `INSERT INTO guide_categories (id, title, sort_order, is_active) VALUES ($1, $2, $3, $4)`,
          [category.id, category.title, category.sortOrder, category.isActive]
        );
      }
    }

    const restaurantsCount = await this.pool.query('SELECT COUNT(*)::int AS count FROM guide_restaurants');
    if (restaurantsCount.rows[0].count === 0) {
      await this.replaceRestaurants(defaultGuideContent.restaurants);
    }

    const wellnessCount = await this.pool.query('SELECT COUNT(*)::int AS count FROM guide_wellness');
    if (wellnessCount.rows[0].count === 0) {
      await this.replaceWellness(defaultGuideContent.wellness);
    }

    const homeCount = await this.pool.query(`SELECT COUNT(*)::int AS count FROM guide_home_content WHERE id = 'main'`);
    if (homeCount.rows[0].count === 0) {
      await this.replaceHomeContent(defaultGuideContent.home);
    }

    console.log('GuideStore: PostgreSQL connected and initialized.');
  }

  async getContent() {
    if (!this.pool) {
      return {
        restaurants: memoryState.restaurants.map((item) => ({ ...item, tags: [...(item.tags || [])] })),
        wellness: memoryState.wellness.map((item) => ({ ...item, services: [...item.services], tags: [...(item.tags || [])] })),
        home: cloneHome(memoryState.home)
      };
    }

    const [restaurantsResult, wellnessResult, homeResult] = await Promise.all([
      this.pool.query(
        `SELECT id, title, kind, cuisine, breakfast, vegan, pets, avg_check, address, description, rating, image_label, status, sort_order, featured, phone, website, hours, tags
         FROM guide_restaurants
         ORDER BY featured DESC, sort_order ASC, rating DESC, title ASC`
      ),
      this.pool.query(
        `SELECT id, title, services, child_programs, address, description, rating, image_label, status, sort_order, featured, phone, website, hours, tags
         FROM guide_wellness
         ORDER BY featured DESC, sort_order ASC, rating DESC, title ASC`
      ),
      this.pool.query(`SELECT payload FROM guide_home_content WHERE id = 'main' LIMIT 1`)
    ]);

    return {
      restaurants: restaurantsResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        kind: row.kind,
        cuisine: row.cuisine,
        breakfast: row.breakfast,
        vegan: row.vegan,
        pets: row.pets,
        avgCheck: Number(row.avg_check || 0),
        address: row.address,
        description: row.description,
        rating: Number(row.rating || 0),
        imageLabel: row.image_label,
        status: row.status || 'draft',
        sortOrder: Number(row.sort_order || 0),
        featured: Boolean(row.featured),
        phone: row.phone || '',
        website: row.website || '',
        hours: row.hours || '',
        tags: normalizeTags(row.tags)
      })),
      wellness: wellnessResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        services: Array.isArray(row.services) ? row.services : [],
        childPrograms: row.child_programs,
        address: row.address,
        description: row.description,
        rating: Number(row.rating || 0),
        imageLabel: row.image_label,
        status: row.status || 'draft',
        sortOrder: Number(row.sort_order || 0),
        featured: Boolean(row.featured),
        phone: row.phone || '',
        website: row.website || '',
        hours: row.hours || '',
        tags: normalizeTags(row.tags)
      })),
      home: normalizeHomeContent(homeResult.rows[0]?.payload || defaultGuideContent.home)
    };
  }

  async replaceRestaurants(restaurants) {
    const normalized = Array.isArray(restaurants) ? restaurants.map(normalizeRestaurant) : [];

    if (!this.pool) {
      memoryState.restaurants = normalized.map((item) => ({ ...item, tags: [...item.tags] }));
      return this.getContent();
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM guide_restaurants');
      for (const item of normalized) {
        await client.query(
          `INSERT INTO guide_restaurants (
            id, title, kind, cuisine, breakfast, vegan, pets, avg_check, address, description, rating, image_label, status, sort_order, featured, phone, website, hours, tags, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19::jsonb, NOW())`,
          [
            item.id,
            item.title,
            item.kind,
            item.cuisine,
            item.breakfast,
            item.vegan,
            item.pets,
            item.avgCheck,
            item.address,
            item.description,
            item.rating,
            item.imageLabel,
            item.status,
            item.sortOrder,
            item.featured,
            item.phone,
            item.website,
            item.hours,
            JSON.stringify(item.tags)
          ]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return this.getContent();
  }

  async replaceWellness(wellness) {
    const normalized = Array.isArray(wellness) ? wellness.map(normalizeWellness) : [];

    if (!this.pool) {
      memoryState.wellness = normalized.map((item) => ({ ...item, services: [...item.services], tags: [...item.tags] }));
      return this.getContent();
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM guide_wellness');
      for (const item of normalized) {
        await client.query(
          `INSERT INTO guide_wellness (
            id, title, services, child_programs, address, description, rating, image_label, status, sort_order, featured, phone, website, hours, tags, updated_at
          ) VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, NOW())`,
          [
            item.id,
            item.title,
            JSON.stringify(item.services),
            item.childPrograms,
            item.address,
            item.description,
            item.rating,
            item.imageLabel,
            item.status,
            item.sortOrder,
            item.featured,
            item.phone,
            item.website,
            item.hours,
            JSON.stringify(item.tags)
          ]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return this.getContent();
  }

  async replaceHomeContent(home) {
    const normalized = normalizeHomeContent(home);

    if (!this.pool) {
      memoryState.home = cloneHome(normalized);
      return this.getContent();
    }

    await this.pool.query(
      `INSERT INTO guide_home_content (id, payload, updated_at)
       VALUES ('main', $1::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [JSON.stringify(normalized)]
    );

    return this.getContent();
  }

  async resetContent() {
    await this.replaceRestaurants(defaultGuideContent.restaurants);
    await this.replaceWellness(defaultGuideContent.wellness);
    await this.replaceHomeContent(defaultGuideContent.home);
    return this.getContent();
  }

  async getOwnerSummary() {
    const content = await this.getContent();
    const publishedRestaurants = content.restaurants.filter((item) => item.status === 'published').length;
    const publishedWellness = content.wellness.filter((item) => item.status === 'published').length;
    return {
      sections: 14,
      listingsReady: 2,
      pwaEnabled: true,
      restaurants: content.restaurants.length,
      wellness: content.wellness.length,
      publishedRestaurants,
      publishedWellness,
      featuredOnHome: content.home.popular.length,
      storage: this.pool ? 'postgresql' : 'memory'
    };
  }
}

module.exports = {
  createGuideStore: () => new GuideStore()
};
