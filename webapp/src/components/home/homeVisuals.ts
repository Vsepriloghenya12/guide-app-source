import type { GuideCategory } from '../../types';

const quickIconsById: Partial<Record<GuideCategory['id'], string>> = {
  culture: '/home-icons/attractions.png',
  events: '/home-icons/attractions.png',
  restaurants: '/home-icons/food.png',
  routes: '/home-icons/beaches.png',
  'photo-spots': '/home-icons/beaches.png',
  hotels: '/home-icons/leisure.png',
  wellness: '/home-icons/leisure.png',
  'active-rest': '/home-icons/leisure.png',
  shops: '/home-icons/shopping.png',
  kids: '/home-icons/leisure.png',
  transport: '/home-icons/shopping.png',
  atm: '/home-icons/shopping.png',
  medicine: '/home-icons/leisure.png',
  'car-rental': '/home-icons/shopping.png'
};

const orderedQuickIcons = [
  '/home-icons/attractions.png',
  '/home-icons/food.png',
  '/home-icons/beaches.png',
  '/home-icons/leisure.png',
  '/home-icons/shopping.png'
];

const accentFallback: Record<string, string> = {
  coast: '/home-hero-background.png',
  sunset: '/home-hero-background.png',
  bridge: '/home-icons/attractions.png',
  emerald: '/home-icons/leisure.png'
};

const toneByCategoryId: Partial<Record<GuideCategory['id'], string>> = {
  restaurants: 'sunset',
  wellness: 'emerald',
  'active-rest': 'sunset',
  routes: 'bridge',
  hotels: 'coast',
  events: 'sunset',
  transport: 'bridge',
  atm: 'emerald',
  shops: 'sunset',
  culture: 'coast',
  kids: 'emerald',
  medicine: 'emerald',
  'photo-spots': 'sunset',
  'car-rental': 'bridge'
};

export function getQuickMenuImage(category: GuideCategory, index: number): string {
  return quickIconsById[category.id] || orderedQuickIcons[index % orderedQuickIcons.length];
}

export function getCategoryListImage(category: GuideCategory, index: number): string {
  if (category.imageSrc) {
    return category.imageSrc;
  }

  return quickIconsById[category.id] || accentFallback[category.accent] || orderedQuickIcons[index % orderedQuickIcons.length];
}

export function getCategoryTone(category: Pick<GuideCategory, 'id' | 'accent'>): string {
  return category.accent || toneByCategoryId[category.id] || 'coast';
}

export function getPlaceTone(categoryId: GuideCategory['id']): string {
  return toneByCategoryId[categoryId] || 'coast';
}
