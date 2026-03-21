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

export function createGoogleDirectionsUrl(
  place: Pick<Listing, 'mapQuery' | 'address' | 'title'>,
  origin?: { lat: number; lng: number } | null
) {
  const destination = encodeURIComponent(getPlaceMapQuery(place));
  if (!origin) {
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination}&travelmode=driving`;
}

export function createAppleDirectionsUrl(
  place: Pick<Listing, 'mapQuery' | 'address' | 'title'>,
  origin?: { lat: number; lng: number } | null
) {
  const destination = encodeURIComponent(getPlaceMapQuery(place));
  if (!origin) {
    return `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
  }

  return `https://maps.apple.com/?saddr=${origin.lat},${origin.lng}&daddr=${destination}&dirflg=d`;
}

export function create2GisDirectionsUrl(
  place: Pick<Listing, 'mapQuery' | 'address' | 'title'>,
  origin?: { lat: number; lng: number } | null
) {
  const destination = encodeURIComponent(getPlaceMapQuery(place));
  if (!origin) {
    return `https://2gis.com/routeSearch/rsType/car/to/${destination}`;
  }

  return `https://2gis.com/routeSearch/rsType/car/from/${origin.lng},${origin.lat}/to/${destination}`;
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

export function estimateTravelTime(distanceKm: number | null, mode: 'walk' | 'drive' = 'drive') {
  if (distanceKm === null || !Number.isFinite(distanceKm)) {
    return '';
  }

  const speed = mode === 'walk' ? 4.5 : 28;
  const totalMinutes = Math.max(1, Math.round((distanceKm / speed) * 60));

  if (totalMinutes < 60) {
    return `${totalMinutes} мин`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`;
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

export function comparePlacesByPriority(left: Partial<Listing>, right: Partial<Listing>) {
  const leftOrder = Number(left.sortOrder ?? 1000);
  const rightOrder = Number(right.sortOrder ?? 1000);
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  const leftTop = Boolean(left.top ?? left.featured);
  const rightTop = Boolean(right.top ?? right.featured);
  if (leftTop !== rightTop) {
    return Number(rightTop) - Number(leftTop);
  }

  const leftRating = Number(left.rating ?? 0);
  const rightRating = Number(right.rating ?? 0);
  if (leftRating !== rightRating) {
    return rightRating - leftRating;
  }

  return String(left.title || '').localeCompare(String(right.title || ''));
}

export function sortPlacesByPriority<T extends Partial<Listing>>(places: T[]) {
  return [...places].sort(comparePlacesByPriority);
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
