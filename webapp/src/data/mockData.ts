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
    imageLabel: 'Видовой ресторан',
    imageUrl: '',
    phone: '',
    website: '',
    hours: '09:00–23:00',
    isFeatured: true,
    featuredRank: 2,
    status: 'published'
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
    imageLabel: 'Спа-комплекс',
    imageUrl: '',
    phone: '',
    website: '',
    hours: '10:00–22:00',
    isFeatured: false,
    featuredRank: 0,
    status: 'published'
  }
];
