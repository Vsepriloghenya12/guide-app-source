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
    imageSrc?: string;
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
    imageSrc: options.imageSrc ?? '',
    sortOrder: 100,
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
    accent: 'sunset',
    description: 'Серф, SUP, роуп-парки, водные активности и места с драйвом.',
    quickFilters: ['outdoor', 'family', 'water'],
    fields: ['kind', 'tags', 'district']
  }),
  makeCategory('routes', 'Маршруты и тропы', '/section/routes', {
    showOnHome: true,
    shortTitle: 'Маршруты',
    accent: 'bridge',
    description: 'Пешие маршруты, смотровые, sunrise/spots и готовые мини-гайды.',
    quickFilters: ['sunrise', 'sunset', 'view'],
    fields: ['kind', 'tags', 'district']
  }),
  makeCategory('hotels', 'Отели и проживание', '/section/hotels', {
    shortTitle: 'Отели',
    accent: 'coast',
    description: 'Отели, апартаменты и варианты проживания в разных районах.',
    quickFilters: [],
    fields: ['hotelStars', 'hotelPool', 'hotelSpa', 'petFriendly', 'district']
  }),
  makeCategory('events', 'Афиша', '/section/events', {
    showOnHome: true,
    shortTitle: 'Афиша',
    accent: 'sunset',
    description: 'События, вечеринки, мастер-классы и планы на ближайшие дни.',
    quickFilters: ['today', 'weekend', 'free'],
    fields: ['kind', 'tags', 'district']
  }),
  makeCategory('transport', 'Транспорт', '/section/transport', {
    shortTitle: 'Транспорт',
    accent: 'bridge',
    description: 'Трансферы, такси, шаттлы и полезные транспортные сервисы.',
    quickFilters: ['airport', '24/7', 'delivery'],
    fields: ['kind', 'services', 'district']
  }),
  makeCategory('atm', 'Банкоматы', '/section/atm', {
    shortTitle: 'Банкоматы',
    accent: 'emerald',
    description: 'Банкоматы, банки и точки снятия наличных в удобных районах.',
    quickFilters: ['24/7', 'usd', 'beach'],
    fields: ['kind', 'services', 'district']
  }),
  makeCategory('shops', 'Магазины и сувениры', '/section/shops', {
    showOnHome: true,
    shortTitle: 'Магазины',
    accent: 'sunset',
    description: 'Сувениры, локальные бренды, рынки и приятные точки для шопинга.',
    quickFilters: ['market', 'local', 'design'],
    fields: ['kind', 'tags', 'district']
  }),
  makeCategory('culture', 'Культура и достопримечательности', '/section/culture', {
    showOnHome: true,
    shortTitle: 'Культура',
    accent: 'coast',
    description: 'Храмы, музеи, мосты, смотровые и главные точки города.',
    quickFilters: ['museum', 'temple', 'view'],
    fields: ['kind', 'tags', 'district']
  }),
  makeCategory('kids', 'Детский отдых', '/section/kids', {
    shortTitle: 'Детям',
    accent: 'emerald',
    description: 'Семейные локации, игровые, кафе и места, куда удобно идти с детьми.',
    quickFilters: ['family', 'indoor', 'outdoor'],
    fields: ['kind', 'tags', 'district']
  }),
  makeCategory('medicine', 'Медицина', '/section/medicine', {
    shortTitle: 'Медицина',
    accent: 'bridge',
    description: 'Клиники, аптеки, стоматология и точки, которые полезно знать заранее.',
    quickFilters: ['24/7', 'english', 'pharmacy'],
    fields: ['kind', 'services', 'district']
  }),
  makeCategory('photo-spots', 'Фото зоны / смотровые', '/section/photo-spots', {
    shortTitle: 'Фото-споты',
    accent: 'sunset',
    description: 'Смотровые, пляжи, rooftop и места с лучшим светом для фото.',
    quickFilters: ['sunrise', 'sunset', 'view'],
    fields: ['kind', 'tags', 'district']
  }),
  makeCategory('car-rental', 'Авто прокат', '/section/car-rental', {
    shortTitle: 'Автопрокат',
    accent: 'bridge',
    description: 'Аренда байков и авто, доставка транспорта и удобные условия на каждый день.',
    quickFilters: ['bike', 'car', 'delivery'],
    fields: ['kind', 'services', 'avgCheck', 'district']
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
