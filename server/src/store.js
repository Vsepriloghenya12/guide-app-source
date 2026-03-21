const {
  getCategories,
  getContentStore,
  getPlaceById,
  getPlaceBySlug,
  getPlaces,
  saveContentStore,
  upsertPlace,
  deletePlace
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
}

module.exports = { GuideStore };
