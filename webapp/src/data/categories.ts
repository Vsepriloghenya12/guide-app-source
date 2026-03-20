import { HomeCategory, HomeFeature } from '../types';

export const homeFeatures: HomeFeature[] = [
  {
    id: 'top-restaurants',
    title: 'Топ 5 ресторанов',
    description: 'Подборка лучших мест с красивой подачей и атмосферой.',
    path: '/restaurants',
    tone: 'coast'
  },
  {
    id: 'spa-selection',
    title: 'Лучшие SPA-программы',
    description: 'Где расслабиться, восстановиться и провести красивый slow day.',
    path: '/wellness',
    tone: 'sunset'
  }
];

export const homeCategories: HomeCategory[] = [
  { id: 'food', title: 'Еда', subtitle: 'рестораны, завтраки и локальные места', path: '/restaurants', badge: 'Популярно', tone: 'orange' },
  { id: 'wellness', title: 'СПА', subtitle: 'ритуалы, массаж и отдых', path: '/wellness', tone: 'green' },
  { id: 'events', title: 'Афиша', subtitle: 'события, бары и городская жизнь', path: '/section/events', tone: 'blue' },
  { id: 'culture', title: 'Культура', subtitle: 'музеи, достопримечательности и прогулки', path: '/section/culture', tone: 'pink' },
  { id: 'shops', title: 'Шопинг', subtitle: 'магазины, рынки и сувениры', path: '/section/shops', tone: 'red' },
  { id: 'nature', title: 'Природа', subtitle: 'маршруты, виды и короткие выезды', path: '/section/routes', badge: 'Маршруты', tone: 'teal' }
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
