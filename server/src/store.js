const {
  deleteCategory,
  deletePlace,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  getContentStore,
  getPlaceById,
  getPlaceBySlug,
  getPlaces,
  saveCollections,
  saveContentStore,
  saveHomeContent,
  saveTips,
  updateCollectionItems,
  upsertCategory,
  upsertPlace
} = require('./db');

class GuideStore {
  async init() {
    return true;
  }

  async getContent() {
    return getContentStore();
  }

  async getCategories() {
    return getCategories();
  }

  async getCategoryById(id) {
    return getCategoryById(id);
  }

  async getCategoryBySlug(slug) {
    return getCategoryBySlug(slug);
  }

  async saveCategory(category) {
    return upsertCategory(category);
  }

  async deleteCategory(id) {
    return deleteCategory(id);
  }

  async getPlaces(options) {
    return getPlaces(options);
  }

  async getPlaceById(id) {
    return getPlaceById(id);
  }

  async getPlaceBySlug(slug) {
    return getPlaceBySlug(slug);
  }

  async saveContent(content) {
    return saveContentStore(content);
  }

  async savePlace(place) {
    return upsertPlace(place);
  }

  async deletePlace(id) {
    return deletePlace(id);
  }

  async saveTips(items) {
    return saveTips(items);
  }

  async saveCollections(items) {
    return saveCollections(items);
  }

  async saveCollectionItems(collectionIdOrSlug, itemIds) {
    return updateCollectionItems(collectionIdOrSlug, itemIds);
  }

  async saveHome(home) {
    return saveHomeContent(home);
  }
}

module.exports = { GuideStore };
