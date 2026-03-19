import { RestaurantItem, WellnessItem } from '../types';

export const restaurants: RestaurantItem[] = [
  {
    id: 'r-1',
    title: 'Panorama Terrace',
    kind: 'restaurant',
    cuisine: 'european',
    breakfast: true,
    vegan: true,
    pets: true,
    avgCheck: 900,
    address: 'Набережная, 14',
    description: 'Элегантный ресторан с видом на город, винной картой и атмосферным интерьером.',
    rating: 4.9,
    imageLabel: 'Видовой ресторан'
  },
  {
    id: 'r-2',
    title: 'Silk Garden',
    kind: 'restaurant',
    cuisine: 'vietnamese',
    breakfast: false,
    vegan: false,
    pets: false,
    avgCheck: 550,
    address: 'Центральная улица, 8',
    description: 'Современная локальная кухня, авторская подача и спокойная вечерняя атмосфера.',
    rating: 4.7,
    imageLabel: 'Локальная кухня'
  },
  {
    id: 'r-3',
    title: 'Morning Roast',
    kind: 'coffee',
    cuisine: 'european',
    breakfast: true,
    vegan: true,
    pets: true,
    avgCheck: 290,
    address: 'Парк, 3',
    description: 'Кофейня с завтраками весь день, specialty coffee и уютной террасой.',
    rating: 4.8,
    imageLabel: 'Кофейня и завтраки'
  },
  {
    id: 'r-4',
    title: 'Spice Coast',
    kind: 'restaurant',
    cuisine: 'thai',
    breakfast: false,
    vegan: true,
    pets: false,
    avgCheck: 610,
    address: 'Линия моря, 27',
    description: 'Яркая тайская кухня, панорамные окна и удобный формат для компаний.',
    rating: 4.6,
    imageLabel: 'Тайская кухня'
  },
  {
    id: 'r-5',
    title: 'Old Yard Grill',
    kind: 'club',
    cuisine: 'caucasian',
    breakfast: false,
    vegan: false,
    pets: true,
    avgCheck: 740,
    address: 'Старый квартал, 19',
    description: 'Вечернее место с музыкой, грилем и большими столами для компаний.',
    rating: 4.5,
    imageLabel: 'Клуб и гриль'
  },
  {
    id: 'r-6',
    title: 'Daily Spoon',
    kind: 'canteen',
    cuisine: 'vietnamese',
    breakfast: true,
    vegan: false,
    pets: false,
    avgCheck: 180,
    address: 'Бизнес-район, 4',
    description: 'Практичная столовая с домашней едой, быстрым обслуживанием и понятным меню.',
    rating: 4.3,
    imageLabel: 'Столовая'
  }
];

export const wellnessItems: WellnessItem[] = [
  {
    id: 'w-1',
    title: 'Ocean Balance Spa',
    services: ['massage', 'spa', 'wraps'],
    childPrograms: true,
    address: 'Морской проспект, 5',
    description: 'Спа-комплекс с расслабляющими ритуалами, ароматерапией и приватными кабинетами.',
    rating: 4.9,
    imageLabel: 'Спа-комплекс'
  },
  {
    id: 'w-2',
    title: 'Steam House',
    services: ['sauna', 'hammam'],
    childPrograms: false,
    address: 'Тихая улица, 11',
    description: 'Баня и хамам с зонами отдыха, парными и возможностью бронирования компании.',
    rating: 4.6,
    imageLabel: 'Баня и хамам'
  },
  {
    id: 'w-3',
    title: 'Body Reset Studio',
    services: ['massage', 'cosmetology', 'wraps'],
    childPrograms: false,
    address: 'Городской центр, 21',
    description: 'Уходовые программы, косметология и восстановительные процедуры в камерном формате.',
    rating: 4.7,
    imageLabel: 'Косметология'
  },
  {
    id: 'w-4',
    title: 'Lotus Flow',
    services: ['yoga', 'massage'],
    childPrograms: true,
    address: 'Зелёный квартал, 9',
    description: 'Студия йоги и мягких практик с утренними занятиями и семейными форматами.',
    rating: 4.8,
    imageLabel: 'Йога и массаж'
  },
  {
    id: 'w-5',
    title: 'Golden Hammam Club',
    services: ['hammam', 'spa', 'massage'],
    childPrograms: false,
    address: 'Спа-аллея, 6',
    description: 'Эстетичное пространство с восточным интерьером и премиальными спа-ритуалами.',
    rating: 4.5,
    imageLabel: 'Хамам'
  }
];
