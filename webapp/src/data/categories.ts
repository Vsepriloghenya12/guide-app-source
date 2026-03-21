import { HomeCategory, HomeFeature } from '../types';

export const homeFeatures: HomeFeature[] = [
  {
    id: 'top-restaurants',
    title: 'Топ 5 ресторанов',
    description: 'Подборка лучших мест с красивой подачей и атмосферой.',
    path: '/restaurants'
  },
  {
    id: 'best-excursions',
    title: 'Лучшие экскурсии',
    description: 'Скоро здесь появятся проверенные экскурсии и подборки.',
    path: '/section/excursions'
  },
  {
    id: 'weekend-routes',
    title: 'Маршруты выходного дня',
    description: 'Готовые идеи коротких путешествий на 1–2 дня.',
    path: '/section/weekend-routes'
  }
];

export const homeCategories: HomeCategory[] = [
  { id: 'restaurants', title: 'Рестораны, кафе и столовые', path: '/restaurants', badge: 'Популярно' },
  { id: 'wellness', title: 'СПА и оздоровление', path: '/wellness' },
  { id: 'active-rest', title: 'Активный отдых и экстрим', path: '/section/active-rest' },
  { id: 'routes', title: 'Маршруты и тропы', path: '/section/routes' },
  { id: 'hotels', title: 'Отели и проживание', path: '/section/hotels' },
  { id: 'events', title: 'Афиша', path: '/section/events' },
  { id: 'transport', title: 'Транспорт', path: '/section/transport' },
  { id: 'atm', title: 'Банкоматы', path: '/section/atm' },
  { id: 'shops', title: 'Магазины и сувениры', path: '/section/shops' },
  { id: 'culture', title: 'Культура и достопримечательности', path: '/section/culture' },
  { id: 'kids', title: 'Детский отдых', path: '/section/kids' },
  { id: 'medicine', title: 'Медицина', path: '/section/medicine' },
  { id: 'photo-spots', title: 'Фото зоны / смотровые', path: '/section/photo-spots' },
  { id: 'car-rental', title: 'Авто прокат', path: '/section/car-rental' }
];

export const sectionTitles: Record<string, string> = {
  excursions: 'Лучшие экскурсии',
  'weekend-routes': 'Маршруты выходного дня',
  'active-rest': 'Активный отдых и экстрим',
  routes: 'Маршруты и тропы',
  hotels: 'Отели и проживание',
  events: 'Афиша',
  transport: 'Транспорт',
  atm: 'Банкоматы',
  shops: 'Магазины и сувениры',
  culture: 'Культура и достопримечательности',
  kids: 'Детский отдых',
  medicine: 'Медицина',
  'photo-spots': 'Фото зоны / смотровые',
  'car-rental': 'Авто прокат'
};
