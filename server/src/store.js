const { Pool } = require('pg');
const { defaultCategories, defaultGuideContent } = require('./seed');

function createInMemoryState() {
  return {
    categories: defaultCategories.map((item) => ({ ...item })),
    restaurants: defaultGuideContent.restaurants.map((item) => ({ ...item })),
    wellness: defaultGuideContent.wellness.map((item) => ({ ...item, services: [...item.services] }))
  };
}

const memoryState = createInMemoryState();

function shouldUseSsl(connectionString) {
  if (!connectionString) {
    return false;
  }

  return !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');
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
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

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
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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

    console.log('GuideStore: PostgreSQL connected and initialized.');
  }

  async getContent() {
    if (!this.pool) {
      return {
        restaurants: memoryState.restaurants.map((item) => ({ ...item })),
        wellness: memoryState.wellness.map((item) => ({ ...item, services: [...item.services] }))
      };
    }

    const [restaurantsResult, wellnessResult] = await Promise.all([
      this.pool.query(
        `SELECT id, title, kind, cuisine, breakfast, vegan, pets, avg_check, address, description, rating, image_label
         FROM guide_restaurants
         ORDER BY rating DESC, title ASC`
      ),
      this.pool.query(
        `SELECT id, title, services, child_programs, address, description, rating, image_label
         FROM guide_wellness
         ORDER BY rating DESC, title ASC`
      )
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
        imageLabel: row.image_label
      })),
      wellness: wellnessResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        services: Array.isArray(row.services) ? row.services : [],
        childPrograms: row.child_programs,
        address: row.address,
        description: row.description,
        rating: Number(row.rating || 0),
        imageLabel: row.image_label
      }))
    };
  }

  async replaceRestaurants(restaurants) {
    if (!this.pool) {
      memoryState.restaurants = restaurants.map((item) => ({ ...item }));
      return this.getContent();
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM guide_restaurants');
      for (const item of restaurants) {
        await client.query(
          `INSERT INTO guide_restaurants (
            id, title, kind, cuisine, breakfast, vegan, pets, avg_check, address, description, rating, image_label, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
          [
            item.id,
            item.title,
            item.kind,
            item.cuisine,
            item.breakfast,
            item.vegan,
            item.pets,
            Number(item.avgCheck || 0),
            item.address,
            item.description,
            Number(item.rating || 0),
            item.imageLabel
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
    if (!this.pool) {
      memoryState.wellness = wellness.map((item) => ({ ...item, services: [...item.services] }));
      return this.getContent();
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM guide_wellness');
      for (const item of wellness) {
        await client.query(
          `INSERT INTO guide_wellness (
            id, title, services, child_programs, address, description, rating, image_label, updated_at
          ) VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, NOW())`,
          [
            item.id,
            item.title,
            JSON.stringify(item.services || []),
            item.childPrograms,
            item.address,
            item.description,
            Number(item.rating || 0),
            item.imageLabel
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

  async resetContent() {
    await this.replaceRestaurants(defaultGuideContent.restaurants);
    await this.replaceWellness(defaultGuideContent.wellness);
    return this.getContent();
  }

  async getOwnerSummary() {
    const content = await this.getContent();
    return {
      sections: 14,
      listingsReady: 2,
      pwaEnabled: true,
      restaurants: content.restaurants.length,
      wellness: content.wellness.length,
      storage: this.pool ? 'postgresql' : 'memory'
    };
  }
}

module.exports = {
  createGuideStore: () => new GuideStore()
};
