import type { Listing } from '../types';

export function getPlaceMapQuery(place: Pick<Listing, 'mapQuery' | 'address' | 'title'>) {
  return place.mapQuery || place.address || place.title;
}

export function createGoogleMapsUrl(place: Pick<Listing, 'mapQuery' | 'address' | 'title'>) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getPlaceMapQuery(place))}`;
}

export function createAppleMapsUrl(place: Pick<Listing, 'mapQuery' | 'address' | 'title'>) {
  return `https://maps.apple.com/?q=${encodeURIComponent(getPlaceMapQuery(place))}`;
}

export function create2GisUrl(place: Pick<Listing, 'mapQuery' | 'address' | 'title'>) {
  return `https://2gis.com/?query=${encodeURIComponent(getPlaceMapQuery(place))}`;
}

export function formatDistance(distanceKm: number | null) {
  if (distanceKm === null || !Number.isFinite(distanceKm)) {
    return 'Без расстояния';
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} м`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} км`;
}

export function haversineDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function hasCoordinates(place: Partial<Listing>) {
  return typeof place.lat === 'number' && typeof place.lng === 'number';
}


export function toListingLike(place: Listing): Listing;
export function toListingLike(place: Partial<Listing> & { id: string; title: string; categoryId: Listing['categoryId']; description: string; address: string; rating: number; }): Listing;
export function toListingLike(place: Partial<Listing> & { id: string; title: string; categoryId: Listing['categoryId']; description: string; address: string; rating: number; }): Listing {
  const slug = place.slug || `${place.categorySlug || place.categoryId}-${place.id}`;
  const imageUrls = Array.isArray(place.imageUrls) ? place.imageUrls.filter(Boolean) : Array.isArray(place.imageGallery) ? place.imageGallery.filter(Boolean) : place.imageSrc ? [place.imageSrc] : [];
  return {
    ...place,
    slug,
    categorySlug: place.categorySlug || place.categoryId,
    imageUrls,
    coverImageUrl: place.coverImageUrl || imageUrls[0] || place.imageSrc || '',
    websiteUrl: place.websiteUrl || place.website || '',
    phoneNumber: place.phoneNumber || place.phone || '',
    district: place.district || '',
    location: place.location || place.address || '',
    type: place.type || place.kind || '',
    featured: Boolean(place.featured ?? place.top),
    shortDescription: place.shortDescription || place.description,
    priceLabel: place.priceLabel || (typeof place.avgCheck === 'number' ? `от ${place.avgCheck}` : ''),
    listingType: place.listingType || place.kind || '',
    childFriendly: Boolean(place.childFriendly ?? place.childPrograms),
    petFriendly: Boolean(place.petFriendly ?? place.pets),
    mapQuery: place.mapQuery || place.address || place.title,
    extra: Array.isArray(place.extra) ? place.extra : Array.isArray(place.services) ? place.services : []
  } as Listing;
}
