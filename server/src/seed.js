const { randomUUID } = require('crypto');

const CATEGORY_DEFS = [
  {
    slug: 'restaurants',
    title: 'Рестораны, кафе и столовые',
    shortTitle: 'Еда',
    description: 'Лучшие места для завтраков, ужинов, кофе и локальной кухни.',
    icon: '🍽️',
    coverImageUrl: '/danang-home-poster.png',
    accent: 'orange',
    sortOrder: 10,
    filterSchema: [
      {
        key: 'kind',
        label: 'Формат',
        type: 'single',
        field: 'listingType',
        options: [
          { value: 'restaurant', label: 'Ресторан' },
          { value: 'coffee', label: 'Кофейня' },
          { value: 'canteen', label: 'Столовая' },
          { value: 'bar', label: 'Бар' }
        ]
      },
      {
        key: 'cuisine',
        label: 'Кухня',
        type: 'single',
        field: 'cuisine',
        options: [
          { value: 'european', label: 'Европейская' },
          { value: 'vietnamese', label: 'Вьетнамская' },
          { value: 'thai', label: 'Тайская' },
          { value: 'asian-fusion', label: 'Азиатский fusion' }
        ]
      },
      {
        key: 'features',
        label: 'Особенности',
        type: 'multi',
        field: 'tags',
        options: [
          { value: 'breakfast', label: 'Завтраки' },
          { value: 'sea-view', label: 'Вид на море' },
          { value: 'vegan', label: 'Веган-опции' },
          { value: 'romantic', label: 'Для вечера' }
        ]
      }
    ]
  },
  {
    slug: 'wellness',
    title: 'СПА и оздоровление',
    shortTitle: 'СПА',
    description: 'Массаж, ритуалы восстановления, йога и термальные форматы.',
    icon: '🪷',
    coverImageUrl: '/danang-clean-poster.png',
    accent: 'emerald',
    sortOrder: 20,
    filterSchema: [
      {
        key: 'services',
        label: 'Услуги',
        type: 'multi',
        field: 'services',
        options: [
          { value: 'massage', label: 'Массаж' },
          { value: 'spa', label: 'СПА' },
          { value: 'hammam', label: 'Хамам' },
          { value: 'yoga', label: 'Йога' }
        ]
      },
      {
        key: 'children',
        label: 'С детьми',
        type: 'boolean',
        field: 'childFriendly',
        trueLabel: 'Можно с детьми'
      }
    ]
  },
  {
    slug: 'active-rest',
    title: 'Активный отдых и экстрим',
    shortTitle: 'Активности',
    description: 'Серфинг, каяки, роуп-парки и адреналиновые активности.',
    icon: '🏄',
    coverImageUrl: '/danang-home-poster.png',
    accent: 'cyan',
    sortOrder: 30,
    filterSchema: [
      {
        key: 'difficulty',
        label: 'Уровень',
        type: 'single',
        field: 'extra.difficulty',
        options: [
          { value: 'easy', label: 'Лёгкий' },
          { value: 'medium', label: 'Средний' },
          { value: 'hard', label: 'Активный' }
        ]
      },
      {
        key: 'water',
        label: 'Тип отдыха',
        type: 'multi',
        field: 'tags',
        options: [
          { value: 'water', label: 'Вода' },
          { value: 'mountain', label: 'Горы' },
          { value: 'family', label: 'Семейно' }
        ]
      }
    ]
  },
  {
    slug: 'routes',
    title: 'Маршруты и тропы',
    shortTitle: 'Маршруты',
    description: 'Проверенные короткие и длинные маршруты с красивыми точками.',
    icon: '🌿',
    coverImageUrl: '/danang-clean-poster.png',
    accent: 'green',
    sortOrder: 40,
    filterSchema: [
      {
        key: 'duration',
        label: 'Длительность',
        type: 'single',
        field: 'extra.durationBucket',
        options: [
          { value: 'short', label: 'До 2 часов' },
          { value: 'half-day', label: 'Полдня' },
          { value: 'full-day', label: 'Целый день' }
        ]
      },
      {
        key: 'view',
        label: 'Что ждёт',
        type: 'multi',
        field: 'tags',
        options: [
          { value: 'sea-view', label: 'Вид на море' },
          { value: 'sunrise', label: 'Рассвет' },
          { value: 'nature', label: 'Природа' }
        ]
      }
    ]
  },
  {
    slug: 'hotels',
    title: 'Отели и проживание',
    shortTitle: 'Отели',
    description: 'Бутик-отели, апартаменты и комфортное проживание рядом с морем.',
    icon: '🛎️',
    coverImageUrl: '/danang-home-poster.png',
    accent: 'violet',
    sortOrder: 50,
    filterSchema: [
      {
        key: 'hotelType',
        label: 'Тип',
        type: 'single',
        field: 'listingType',
        options: [
          { value: 'hotel', label: 'Отель' },
          { value: 'apartments', label: 'Апартаменты' },
          { value: 'villa', label: 'Вилла' }
        ]
      },
      {
        key: 'hotelFeatures',
        label: 'Условия',
        type: 'multi',
        field: 'tags',
        options: [
          { value: 'pool', label: 'Бассейн' },
          { value: 'family', label: 'Семейно' },
          { value: 'sea-view', label: 'Вид' }
        ]
      }
    ]
  },
  {
    slug: 'events',
    title: 'Афиша',
    shortTitle: 'Афиша',
    description: 'События сегодня, на выходных и в ближайшие дни.',
    icon: '🎫',
    coverImageUrl: '/danang-clean-poster.png',
    accent: 'pink',
    sortOrder: 60,
    filterSchema: [
      {
        key: 'eventType',
        label: 'Тип события',
        type: 'single',
        field: 'listingType',
        options: [
          { value: 'concert', label: 'Концерт' },
          { value: 'party', label: 'Вечеринка' },
          { value: 'family', label: 'Семейное' },
          { value: 'market', label: 'Маркет' }
        ]
      },
      {
        key: 'period',
        label: 'Период',
        type: 'single',
        field: 'extra.period',
        options: [
          { value: 'today', label: 'Сегодня' },
          { value: 'weekend', label: 'На выходных' },
          { value: 'soon', label: 'Скоро' }
        ]
      }
    ]
  },
  {
    slug: 'transport',
    title: 'Транспорт',
    shortTitle: 'Транспорт',
    description: 'Такси, шаттлы, трансферы и удобные способы передвижения.',
    icon: '🚕',
    coverImageUrl: '/danang-home-poster.png',
    accent: 'amber',
    sortOrder: 70,
    filterSchema: [
      {
        key: 'transportType',
        label: 'Формат',
        type: 'single',
        field: 'listingType',
        options: [
          { value: 'taxi', label: 'Такси' },
          { value: 'transfer', label: 'Трансфер' },
          { value: 'rent', label: 'Аренда с водителем' }
        ]
      }
    ]
  },
  {
    slug: 'atm',
    title: 'Банкоматы',
    shortTitle: 'Банкоматы',
    description: 'Снятие наличных, лимиты и банки в удобных районах.',
    icon: '🏧',
    coverImageUrl: '/danang-clean-poster.png',
    accent: 'blue',
    sortOrder: 80,
    filterSchema: [
      {
        key: 'bank',
        label: 'Банк',
        type: 'single',
        field: 'listingType',
        options: [
          { value: 'acb', label: 'ACB' },
          { value: 'vcb', label: 'Vietcombank' },
          { value: 'tpb', label: 'TPBank' }
        ]
      }
    ]
  },
  {
    slug: 'shops',
    title: 'Магазины и сувениры',
    shortTitle: 'Шопинг',
    description: 'Локальные сувениры, подарки, концепт-сторы и рынки.',
    icon: '🛍️',
    coverImageUrl: '/danang-home-poster.png',
    accent: 'rose',
    sortOrder: 90,
    filterSchema: [
      {
        key: 'shopType',
        label: 'Тип магазина',
        type: 'single',
        field: 'listingType',
        options: [
          { value: 'souvenir', label: 'Сувениры' },
          { value: 'market', label: 'Маркет' },
          { value: 'concept', label: 'Концепт-стор' }
        ]
      }
    ]
  },
  {
    slug: 'culture',
    title: 'Культура и достопримечательности',
    shortTitle: 'Культура',
    description: 'Главные точки города, музеи, мосты и атмосферные локации.',
    icon: '🏯',
    coverImageUrl: '/danang-clean-poster.png',
    accent: 'purple',
    sortOrder: 100,
    filterSchema: [
      {
        key: 'cultureType',
        label: 'Формат',
        type: 'single',
        field: 'listingType',
        options: [
          { value: 'sight', label: 'Достопримечательность' },
          { value: 'museum', label: 'Музей' },
          { value: 'walk', label: 'Прогулка' }
        ]
      }
    ]
  },
  {
    slug: 'kids',
    title: 'Детский отдых',
    shortTitle: 'Дети',
    description: 'Идеи для семейного отдыха с детьми разного возраста.',
    icon: '🎈',
    coverImageUrl: '/danang-home-poster.png',
    accent: 'coral',
    sortOrder: 110,
    filterSchema: [
      {
        key: 'age',
        label: 'Возраст',
        type: 'single',
        field: 'extra.ageBucket',
        options: [
          { value: '3+', label: '3+' },
          { value: '6+', label: '6+' },
          { value: 'all', label: 'Для всех' }
        ]
      }
    ]
  },
  {
    slug: 'medicine',
    title: 'Медицина',
    shortTitle: 'Медицина',
    description: 'Клиники, аптеки и медицинская помощь для туристов.',
    icon: '🩺',
    coverImageUrl: '/danang-clean-poster.png',
    accent: 'red',
    sortOrder: 120,
    filterSchema: [
      {
        key: 'medicalType',
        label: 'Формат',
        type: 'single',
        field: 'listingType',
        options: [
          { value: 'clinic', label: 'Клиника' },
          { value: 'pharmacy', label: 'Аптека' },
          { value: 'dentistry', label: 'Стоматология' }
        ]
      }
    ]
  },
  {
    slug: 'photo-spots',
    title: 'Фото-зоны / смотровые',
    shortTitle: 'Фото-точки',
    description: 'Лучшие ракурсы, смотровые и точки заката.',
    icon: '📸',
    coverImageUrl: '/danang-home-poster.png',
    accent: 'gold',
    sortOrder: 130,
    filterSchema: [
      {
        key: 'bestTime',
        label: 'Лучшее время',
        type: 'single',
        field: 'extra.bestTime',
        options: [
          { value: 'sunrise', label: 'Рассвет' },
          { value: 'day', label: 'День' },
          { value: 'sunset', label: 'Закат' }
        ]
      }
    ]
  },
  {
    slug: 'car-rental',
    title: 'Авто прокат',
    shortTitle: 'Авто',
    description: 'Аренда авто и байков, условия, страховка и рекомендации.',
    icon: '🚗',
    coverImageUrl: '/danang-clean-poster.png',
    accent: 'slate',
    sortOrder: 140,
    filterSchema: [
      {
        key: 'vehicle',
        label: 'Техника',
        type: 'single',
        field: 'listingType',
        options: [
          { value: 'car', label: 'Авто' },
          { value: 'scooter', label: 'Скутер' },
          { value: 'premium', label: 'Премиум' }
        ]
      }
    ]
  }
];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function makeListing(partial) {
  const id = partial.id || randomUUID();
  return {
    id,
    slug: partial.slug || slugify(`${partial.categorySlug}-${partial.title}-${id.slice(0, 4)}`),
    categorySlug: partial.categorySlug,
    title: partial.title,
    shortDescription: partial.shortDescription || partial.description,
    description: partial.description,
    address: partial.address,
    phone: partial.phone || '',
    website: partial.website || '',
    hours: partial.hours || 'Ежедневно',
    mapQuery: partial.mapQuery || partial.address || partial.title,
    averagePrice: partial.averagePrice || null,
    priceLabel: partial.priceLabel || '',
    rating: partial.rating || 4.7,
    listingType: partial.listingType || '',
    cuisine: partial.cuisine || '',
    services: partial.services || [],
    tags: partial.tags || [],
    features: partial.features || [],
    childFriendly: Boolean(partial.childFriendly),
    petFriendly: Boolean(partial.petFriendly),
    status: partial.status || 'published',
    sortOrder: partial.sortOrder || 100,
    featured: Boolean(partial.featured),
    imageUrls: partial.imageUrls || ['/danang-clean-poster.png'],
    extra: partial.extra || {}
  };
}

const LISTINGS = [
  makeListing({
    categorySlug: 'restaurants',
    title: 'Panorama Terrace',
    shortDescription: 'Видовой ресторан для красивого ужина.',
    description: 'Элегантный ресторан с видом на город, винной картой и удобной посадкой для ужинов и встреч.',
    address: 'Набережная, 14',
    phone: '+84 555 000 101',
    website: 'https://example.com/panorama',
    hours: '08:00–23:00',
    averagePrice: 900,
    priceLabel: 'Средний чек 900k VND',
    rating: 4.9,
    listingType: 'restaurant',
    cuisine: 'european',
    tags: ['sea-view', 'romantic', 'breakfast'],
    childFriendly: true,
    petFriendly: false,
    featured: true,
    imageUrls: ['/danang-home-poster.png', '/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'restaurants',
    title: 'Morning Roast',
    shortDescription: 'Specialty coffee и завтраки весь день.',
    description: 'Кофейня у парка с авторскими напитками, завтраками и комфортной посадкой для работы.',
    address: 'Парк, 3',
    phone: '+84 555 000 102',
    hours: '07:00–20:00',
    averagePrice: 290,
    priceLabel: 'Средний чек 290k VND',
    rating: 4.8,
    listingType: 'coffee',
    cuisine: 'european',
    tags: ['breakfast', 'vegan'],
    childFriendly: true,
    petFriendly: true,
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'wellness',
    title: 'Ocean Balance Spa',
    shortDescription: 'Спа-комплекс с расслабляющими ритуалами.',
    description: 'Приватные кабинеты, аромаритуалы и комфортный формат для восстановления после перелёта или насыщенного дня.',
    address: 'Морской проспект, 5',
    phone: '+84 555 000 201',
    hours: '10:00–22:00',
    averagePrice: 1200,
    priceLabel: 'Программы от 1 200k VND',
    rating: 4.9,
    listingType: 'spa',
    services: ['massage', 'spa'],
    tags: ['relax', 'premium'],
    childFriendly: true,
    featured: true,
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'wellness',
    title: 'Lotus Flow',
    shortDescription: 'Йога и мягкие телесные практики.',
    description: 'Студия йоги и восстановления с утренними занятиями, массажем и камерной атмосферой.',
    address: 'Зелёный квартал, 9',
    phone: '+84 555 000 202',
    hours: '06:30–21:00',
    averagePrice: 450,
    priceLabel: 'Занятия от 450k VND',
    rating: 4.8,
    listingType: 'studio',
    services: ['yoga', 'massage'],
    tags: ['mindfulness', 'family'],
    childFriendly: true,
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'active-rest',
    title: 'My Khe Surf Club',
    shortDescription: 'Серф-уроки на пляже для новичков и продолжающих.',
    description: 'Групповые и индивидуальные тренировки на волне, аренда досок и пляжная зона отдыха.',
    address: 'Пляж My Khe, сектор B',
    averagePrice: 650,
    priceLabel: 'Урок от 650k VND',
    rating: 4.7,
    listingType: 'surf',
    tags: ['water', 'family'],
    extra: { difficulty: 'medium' },
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'active-rest',
    title: 'Son Tra Adventure Trail',
    shortDescription: 'Джип-тур и трек с видовыми точками.',
    description: 'Комбинация лёгкого трека и поездки к обзорным точкам на полуострове Son Tra.',
    address: 'Старт у полуострова Son Tra',
    averagePrice: 900,
    priceLabel: 'Тур от 900k VND',
    rating: 4.6,
    listingType: 'tour',
    tags: ['mountain', 'nature'],
    extra: { difficulty: 'hard' },
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'routes',
    title: 'Sunrise Peninsula Loop',
    shortDescription: 'Маршрут на рассвете с фото-точками.',
    description: 'Короткий утренний маршрут с несколькими остановками, лучшим светом и приятным темпом.',
    address: 'Старт: мост Dragon Bridge',
    averagePrice: 0,
    priceLabel: 'Бесплатно',
    listingType: 'route',
    tags: ['sunrise', 'sea-view', 'nature'],
    extra: { durationBucket: 'short' },
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'routes',
    title: 'Cloud Pass One Day',
    shortDescription: 'День в дороге с панорамными остановками.',
    description: 'Маршрут для самостоятельной поездки с основными точками по пути, кофе-стопами и видами.',
    address: 'Старт: центр Дананга',
    averagePrice: 0,
    priceLabel: 'Расходы зависят от транспорта',
    listingType: 'route',
    tags: ['sea-view', 'nature'],
    extra: { durationBucket: 'full-day' },
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'hotels',
    title: 'Blue Coast Suites',
    shortDescription: 'Бутик-отель у моря.',
    description: 'Современный отель в шаге от пляжа с бассейном и хорошим завтраком.',
    address: 'Линия моря, 22',
    averagePrice: 2400,
    priceLabel: 'От 2 400k VND / ночь',
    listingType: 'hotel',
    tags: ['pool', 'sea-view'],
    childFriendly: true,
    rating: 4.8,
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'hotels',
    title: 'Garden Family Apartments',
    shortDescription: 'Апартаменты для длительного проживания.',
    description: 'Удобный формат для семьи или поездки на несколько недель, кухня и просторная гостиная.',
    address: 'Тихий квартал, 12',
    averagePrice: 1800,
    priceLabel: 'От 1 800k VND / ночь',
    listingType: 'apartments',
    tags: ['family'],
    childFriendly: true,
    petFriendly: true,
    rating: 4.6,
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'events',
    title: 'Friday Rooftop Sunset',
    shortDescription: 'Музыка и закат на крыше.',
    description: 'Лёгкий пятничный ивент с коктейлями, dj-set и видом на город.',
    address: 'Skyline Rooftop, этаж 24',
    averagePrice: 350,
    priceLabel: 'Вход 350k VND',
    listingType: 'party',
    tags: ['music', 'sunset'],
    rating: 4.5,
    featured: true,
    extra: { date: '2026-03-21', time: '19:00', period: 'weekend' },
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'events',
    title: 'Family Market by the River',
    shortDescription: 'Маркет локальных брендов и еды.',
    description: 'Семейный формат с музыкой, фудкортом, детской зоной и товарами локальных мастеров.',
    address: 'River Walk',
    averagePrice: 0,
    priceLabel: 'Вход свободный',
    listingType: 'market',
    tags: ['family', 'shopping'],
    rating: 4.6,
    extra: { date: '2026-03-22', time: '16:00', period: 'weekend' },
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'transport',
    title: 'City Transfer 24/7',
    shortDescription: 'Проверенный трансфер по городу и в аэропорт.',
    description: 'Русскоязычная поддержка, быстрый отклик и понятная стоимость без сюрпризов.',
    address: 'Онлайн',
    phone: '+84 555 000 701',
    averagePrice: 250,
    priceLabel: 'Поездки от 250k VND',
    listingType: 'transfer',
    rating: 4.7,
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'transport',
    title: 'Beach Taxi Pick-up',
    shortDescription: 'Такси из пляжного района в центр.',
    description: 'Удобный вариант для коротких поездок по городу с быстрым вызовом.',
    address: 'Пляжный район',
    phone: '+84 555 000 702',
    averagePrice: 180,
    priceLabel: 'Средняя поездка 180k VND',
    listingType: 'taxi',
    rating: 4.5,
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'atm',
    title: 'TPBank ATM My Khe',
    shortDescription: 'Удобное снятие наличных рядом с пляжем.',
    description: 'Банкомат с хорошей доступностью и понятным расположением у популярной зоны.',
    address: 'Улица Võ Nguyên Giáp, 88',
    listingType: 'tpb',
    tags: ['24/7'],
    rating: 4.4,
    extra: { withdrawalLimit: '5 000 000 VND' },
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'atm',
    title: 'Vietcombank Center ATM',
    shortDescription: 'Банкомат в центральной части города.',
    description: 'Удобный банкомат рядом с основными улицами и кафе.',
    address: 'Trần Phú, 102',
    listingType: 'vcb',
    tags: ['центр'],
    rating: 4.3,
    extra: { withdrawalLimit: '3 000 000 VND' },
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'shops',
    title: 'Cham Gift House',
    shortDescription: 'Стильные сувениры и небольшие подарки.',
    description: 'Локальный магазин с красивой упаковкой и подборкой предметов для подарка.',
    address: 'Центральный квартал, 7',
    listingType: 'souvenir',
    rating: 4.7,
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'shops',
    title: 'River Concept Store',
    shortDescription: 'Одежда, декор и локальный дизайн.',
    description: 'Концепт-стор с современной подачей, хорошим мерчем и визуально сильной полкой.',
    address: 'River Walk, 5',
    listingType: 'concept',
    rating: 4.6,
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'culture',
    title: 'Dragon Bridge Evening Walk',
    shortDescription: 'Классическая прогулка по центру.',
    description: 'Вечерний маршрут по одной из самых узнаваемых точек города с хорошими ракурсами и атмосферой.',
    address: 'Dragon Bridge',
    listingType: 'walk',
    rating: 4.8,
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'culture',
    title: 'Museum of Cham Sculpture',
    shortDescription: 'Главный музей города.',
    description: 'Коллекция чамской культуры в удобной локации, подходит для спокойного дневного визита.',
    address: '2 Thang 9, 1',
    listingType: 'museum',
    rating: 4.7,
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'kids',
    title: 'Little Waves Play Club',
    shortDescription: 'Игровая зона и занятия для детей.',
    description: 'Мягкая игровая зона, мастер-классы и безопасное пространство для семейного отдыха.',
    address: 'Семейный квартал, 4',
    listingType: 'play',
    childFriendly: true,
    rating: 4.7,
    extra: { ageBucket: '3+' },
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'kids',
    title: 'Aqua Family Park',
    shortDescription: 'Вода, активности и семейный день.',
    description: 'Парк для активного отдыха с детьми, водные зоны и удобная инфраструктура.',
    address: 'Парк у реки',
    listingType: 'family-park',
    childFriendly: true,
    rating: 4.5,
    extra: { ageBucket: 'all' },
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'medicine',
    title: 'Sun Clinic International',
    shortDescription: 'Международная клиника для туристов.',
    description: 'Удобная клиника с англоязычным персоналом и понятной навигацией для туристов.',
    address: 'Медицинский квартал, 11',
    phone: '+84 555 000 1201',
    listingType: 'clinic',
    rating: 4.8,
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'medicine',
    title: 'Harbor Pharmacy',
    shortDescription: 'Аптека с понятным ассортиментом.',
    description: 'Удобная точка рядом с туристическим районом и базовым набором популярных позиций.',
    address: 'Набережная, 9',
    phone: '+84 555 000 1202',
    listingType: 'pharmacy',
    rating: 4.4,
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'photo-spots',
    title: 'Linh Ung Viewpoint',
    shortDescription: 'Смотровая с лучшим светом на рассвете.',
    description: 'Точка для фотографий с видом на море и полуостров, особенно сильна в золотой час.',
    address: 'Полуостров Son Tra',
    listingType: 'viewpoint',
    rating: 4.9,
    extra: { bestTime: 'sunrise' },
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'photo-spots',
    title: 'City Lights Rooftop Spot',
    shortDescription: 'Городские огни и панорама.',
    description: 'Вечерняя точка для атмосферных кадров и сторис с огнями города.',
    address: 'Rooftop District',
    listingType: 'rooftop',
    rating: 4.6,
    extra: { bestTime: 'sunset' },
    imageUrls: ['/danang-clean-poster.png']
  }),
  makeListing({
    categorySlug: 'car-rental',
    title: 'Danang Easy Drive',
    shortDescription: 'Аренда авто на день и дольше.',
    description: 'Прокат авто с базовой страховкой и понятной подачей условий для туристов.',
    address: 'Airport Road, 3',
    phone: '+84 555 000 1401',
    averagePrice: 1200,
    priceLabel: 'От 1 200k VND / день',
    listingType: 'car',
    rating: 4.7,
    imageUrls: ['/danang-home-poster.png']
  }),
  makeListing({
    categorySlug: 'car-rental',
    title: 'Coast Scooter Rent',
    shortDescription: 'Скутеры для города и коротких маршрутов.',
    description: 'Быстрая выдача, шлемы и базовый инструктаж для комфортного старта.',
    address: 'Beach Line, 10',
    phone: '+84 555 000 1402',
    averagePrice: 220,
    priceLabel: 'От 220k VND / день',
    listingType: 'scooter',
    rating: 4.5,
    imageUrls: ['/danang-clean-poster.png']
  })
];

const BANNERS = [
  {
    id: randomUUID(),
    title: 'Guide Da Nang',
    subtitle: 'Живой городской гид с owner-CMS, афишей, подборками и карточками мест.',
    badge: 'Обновлено',
    imageUrl: '/danang-home-poster.png',
    linkPath: '/category/events',
    sortOrder: 10,
    isActive: true
  },
  {
    id: randomUUID(),
    title: 'Топ места недели',
    subtitle: 'Сильные рекомендации на ближайшие дни.',
    badge: 'Подборка',
    imageUrl: '/danang-clean-poster.png',
    linkPath: '/favorites',
    sortOrder: 20,
    isActive: true
  }
];

const COLLECTIONS = [
  {
    id: randomUUID(),
    slug: 'popular',
    title: 'Популярное',
    subtitle: 'Лучшие места, которые owner поднимает наверх.',
    kind: 'listings',
    sortOrder: 10,
    isActive: true
  },
  {
    id: randomUUID(),
    slug: 'categories',
    title: 'Категории',
    subtitle: 'Красивые входы в основные разделы приложения.',
    kind: 'categories',
    sortOrder: 20,
    isActive: true
  },
  {
    id: randomUUID(),
    slug: 'tips',
    title: 'Советы',
    subtitle: 'Текстовые рекомендации на главной.',
    kind: 'tips',
    sortOrder: 30,
    isActive: true
  }
];

const COLLECTION_ITEMS = [
  {
    id: randomUUID(),
    collectionSlug: 'popular',
    itemType: 'listing',
    listingSlug: LISTINGS[0].slug,
    title: LISTINGS[0].title,
    description: LISTINGS[0].shortDescription,
    sortOrder: 10
  },
  {
    id: randomUUID(),
    collectionSlug: 'popular',
    itemType: 'listing',
    listingSlug: LISTINGS[10].slug,
    title: LISTINGS[10].title,
    description: LISTINGS[10].shortDescription,
    sortOrder: 20
  },
  {
    id: randomUUID(),
    collectionSlug: 'categories',
    itemType: 'category',
    categorySlug: 'restaurants',
    title: 'Еда',
    description: 'Лучшие рестораны, кофе и завтраки.',
    icon: '🍽️',
    sortOrder: 10
  },
  {
    id: randomUUID(),
    collectionSlug: 'categories',
    itemType: 'category',
    categorySlug: 'routes',
    title: 'Природа',
    description: 'Смотровые, рассветы и красивые тропы.',
    icon: '🌿',
    sortOrder: 20
  },
  {
    id: randomUUID(),
    collectionSlug: 'categories',
    itemType: 'category',
    categorySlug: 'wellness',
    title: 'СПА',
    description: 'Восстановление и отдых.',
    icon: '🪷',
    sortOrder: 30
  },
  {
    id: randomUUID(),
    collectionSlug: 'categories',
    itemType: 'category',
    categorySlug: 'culture',
    title: 'Культура',
    description: 'Главные точки и прогулки.',
    icon: '🏯',
    sortOrder: 40
  },
  {
    id: randomUUID(),
    collectionSlug: 'tips',
    itemType: 'tip',
    title: 'Где встретить красивый закат',
    description: 'Открой фото-точки и смотровые — там уже собраны лучшие вечерние места.',
    path: '/category/photo-spots',
    sortOrder: 10
  },
  {
    id: randomUUID(),
    collectionSlug: 'tips',
    itemType: 'tip',
    title: 'Что выбрать для первого вечера',
    description: 'Сначала открой популярное, а потом афишу — так проще собрать вечерний маршрут.',
    path: '/category/events',
    sortOrder: 20
  },
  {
    id: randomUUID(),
    collectionSlug: 'tips',
    itemType: 'tip',
    title: 'Где комфортно с детьми',
    description: 'Ищи карточки с отметкой “можно с детьми” — они уже подсвечены на страницах.',
    path: '/category/kids',
    sortOrder: 30
  }
];

function buildSeed() {
  return {
    categories: CATEGORY_DEFS,
    filters: CATEGORY_DEFS.flatMap((category) =>
      category.filterSchema.map((filter, index) => ({
        id: randomUUID(),
        categorySlug: category.slug,
        filterKey: filter.key,
        label: filter.label,
        config: filter,
        sortOrder: (index + 1) * 10
      }))
    ),
    listings: LISTINGS,
    banners: BANNERS,
    collections: COLLECTIONS,
    collectionItems: COLLECTION_ITEMS
  };
}

module.exports = {
  buildSeed,
  CATEGORY_DEFS,
  LISTINGS
};
