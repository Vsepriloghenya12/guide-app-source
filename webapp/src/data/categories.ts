import type { GuideCategory, GuideCategoryId } from '../types';

export const defaultCategories: GuideCategory[] = [
  {
    id: 'restaurants',
    title: 'Рестораны, кафе и столовые',
    path: '/restaurants',
    badge: 'Популярно',
    description: 'Где поесть, выпить кофе или позавтракать.',
    visible: true,
    showOnHome: true
  },
  {
    id: 'wellness',
    title: 'СПА и оздоровление',
    path: '/wellness',
    description: 'СПА, массаж, хамам и мягкие практики.',
    visible: true,
    showOnHome: true
  },
  {
    id: 'active-rest',
    title: 'Активный отдых и экстрим',
    path: '/section/active-rest',
    visible: true,
    showOnHome: true
  },
  {
    id: 'routes',
    title: 'Маршруты и тропы',
    path: '/section/routes',
    visible: true,
    showOnHome: true
  },
  {
    id: 'hotels',
    title: 'Отели и проживание',
    path: '/section/hotels',
    visible: true,
    showOnHome: false
  },
  {
    id: 'events',
    title: 'Афиша',
    path: '/section/events',
    visible: true,
    showOnHome: true
  },
  {
    id: 'transport',
    title: 'Транспорт',
    path: '/section/transport',
    visible: true,
    showOnHome: false
  },
  {
    id: 'atm',
    title: 'Банкоматы',
    path: '/section/atm',
    visible: true,
    showOnHome: false
  },
  {
    id: 'shops',
    title: 'Магазины и сувениры',
    path: '/section/shops',
    visible: true,
    showOnHome: true
  },
  {
    id: 'culture',
    title: 'Культура и достопримечательности',
    path: '/section/culture',
    visible: true,
    showOnHome: true
  },
  {
    id: 'kids',
    title: 'Детский отдых',
    path: '/section/kids',
    visible: true,
    showOnHome: false
  },
  {
    id: 'medicine',
    title: 'Медицина',
    path: '/section/medicine',
    visible: true,
    showOnHome: false
  },
  {
    id: 'photo-spots',
    title: 'Фото зоны / смотровые',
    path: '/section/photo-spots',
    visible: true,
    showOnHome: false
  },
  {
    id: 'car-rental',
    title: 'Авто прокат',
    path: '/section/car-rental',
    visible: true,
    showOnHome: false
  }
];

export const sectionTitles: Record<string, string> = defaultCategories.reduce(
  (accumulator, category) => ({
    ...accumulator,
    [category.id]: category.title
  }),
  {
    excursions: 'Лучшие экскурсии',
    'weekend-routes': 'Маршруты выходного дня'
  } as Record<string, string>
);

export const categoryStatusMap: Record<GuideCategoryId, string> = {
  restaurants: 'Полноценные карточки с фильтрами и контактами',
  wellness: 'Полноценные карточки с услугами и тегами',
  'active-rest': 'Можно использовать как будущий раздел подборок и локаций',
  routes: 'Подходит для маршрутов, гайдов и направлений',
  hotels: 'Готово место под отели и апартаменты',
  events: 'Подходит для баннеров, афиши и подборок',
  transport: 'Можно вынести транспорт, такси и аренду',
  atm: 'Можно добавить карту и банкоматы',
  shops: 'Подойдёт для магазинов и сувениров',
  culture: 'Подойдёт для достопримечательностей и гидов',
  kids: 'Можно сделать семейный раздел',
  medicine: 'Можно вынести клиники и аптеки',
  'photo-spots': 'Подойдёт для локаций и смотровых точек',
  'car-rental': 'Отдельный блок под аренду транспорта'
};
