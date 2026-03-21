import type { GuideCategory, GuideCategoryId } from '../types';

function makeCategory(
  id: GuideCategoryId,
  title: string,
  path: string,
  options: {
    badge?: string;
    description?: string;
    visible?: boolean;
    showOnHome?: boolean;
    shortTitle?: string;
    accent?: string;
    quickFilters?: string[];
    fields?: string[];
  } = {}
): GuideCategory {
  return {
    id,
    title,
    path,
    badge: options.badge,
    description: options.description,
    visible: options.visible ?? true,
    showOnHome: options.showOnHome ?? false,
    slug: id,
    shortTitle: options.shortTitle ?? title,
    accent: options.accent ?? 'coast',
    filterSchema: {
      quickFilters: options.quickFilters ?? [],
      fields: options.fields ?? []
    }
  };
}

export const defaultCategories: GuideCategory[] = [
  makeCategory('restaurants', 'Рестораны, кафе и столовые', '/restaurants', {
    badge: 'Популярно',
    description: 'Где поесть, выпить кофе или позавтракать.',
    showOnHome: true,
    shortTitle: 'Рестораны',
    accent: 'sunset',
    quickFilters: ['breakfast', 'vegan', 'pets'],
    fields: ['avgCheck', 'cuisine', 'kind', 'tags']
  }),
  makeCategory('wellness', 'СПА и оздоровление', '/wellness', {
    description: 'СПА, массаж, хамам и мягкие практики.',
    showOnHome: true,
    shortTitle: 'СПА',
    accent: 'emerald',
    quickFilters: ['childPrograms'],
    fields: ['services', 'avgCheck', 'tags']
  }),
  makeCategory('active-rest', 'Активный отдых и экстрим', '/section/active-rest', {
    showOnHome: true,
    shortTitle: 'Активный отдых',
    accent: 'sunset'
  }),
  makeCategory('routes', 'Маршруты и тропы', '/section/routes', {
    showOnHome: true,
    shortTitle: 'Маршруты',
    accent: 'bridge'
  }),
  makeCategory('hotels', 'Отели и проживание', '/section/hotels', {
    shortTitle: 'Отели',
    accent: 'coast'
  }),
  makeCategory('events', 'Афиша', '/section/events', {
    showOnHome: true,
    shortTitle: 'Афиша',
    accent: 'sunset'
  }),
  makeCategory('transport', 'Транспорт', '/section/transport', {
    shortTitle: 'Транспорт',
    accent: 'bridge'
  }),
  makeCategory('atm', 'Банкоматы', '/section/atm', {
    shortTitle: 'Банкоматы',
    accent: 'emerald'
  }),
  makeCategory('shops', 'Магазины и сувениры', '/section/shops', {
    showOnHome: true,
    shortTitle: 'Магазины',
    accent: 'sunset'
  }),
  makeCategory('culture', 'Культура и достопримечательности', '/section/culture', {
    showOnHome: true,
    shortTitle: 'Культура',
    accent: 'coast'
  }),
  makeCategory('kids', 'Детский отдых', '/section/kids', {
    shortTitle: 'Детям',
    accent: 'emerald'
  }),
  makeCategory('medicine', 'Медицина', '/section/medicine', {
    shortTitle: 'Медицина',
    accent: 'bridge'
  }),
  makeCategory('photo-spots', 'Фото зоны / смотровые', '/section/photo-spots', {
    shortTitle: 'Фото-споты',
    accent: 'sunset'
  }),
  makeCategory('car-rental', 'Авто прокат', '/section/car-rental', {
    shortTitle: 'Автопрокат',
    accent: 'bridge'
  })
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
