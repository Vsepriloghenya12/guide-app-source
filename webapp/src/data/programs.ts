import type { GuideCategoryId } from '../types';

export type StayProgramTone = 'coast' | 'bridge' | 'sunset' | 'emerald';

export type StayProgram = {
  id: string;
  stayLabel: string;
  title: string;
  description: string;
  highlights: string[];
  categoryIds: GuideCategoryId[];
  collectionIds: string[];
  tone: StayProgramTone;
};

export const stayPrograms: StayProgram[] = [
  {
    id: 'weekend',
    stayLabel: '2-3 дня',
    title: 'Первое знакомство с Данангом',
    description: 'Короткий отпуск без перегруза: море, красивые точки и один насыщенный вечер в городе.',
    highlights: ['Пляж', 'Рестораны', 'Видовые места'],
    categoryIds: ['restaurants', 'culture', 'routes'],
    collectionIds: ['collection-1'],
    tone: 'sunset'
  },
  {
    id: 'classic',
    stayLabel: '4-5 дней',
    title: 'Классический отпуск',
    description: 'Баланс между пляжным отдыхом, прогулками по городу, шопингом и спокойными гастро-вечерами.',
    highlights: ['Афиша', 'Маршруты', 'Магазины'],
    categoryIds: ['restaurants', 'events', 'shops', 'culture'],
    collectionIds: ['collection-1', 'collection-2'],
    tone: 'bridge'
  },
  {
    id: 'week',
    stayLabel: '6-7 дней',
    title: 'Полная неделя у моря',
    description: 'Размеренный ритм отдыха с возможностью чередовать пляж, релакс, прогулки и активные дни.',
    highlights: ['СПА', 'Культура', 'Активный отдых'],
    categoryIds: ['restaurants', 'wellness', 'active-rest', 'culture', 'routes'],
    collectionIds: ['collection-2'],
    tone: 'emerald'
  },
  {
    id: 'long',
    stayLabel: '8+ дней',
    title: 'Длинный отдых в своем ритме',
    description: 'Подходит для тех, кто хочет жить в городе спокойнее: исследовать район за районом и не спешить.',
    highlights: ['Транспорт', 'Шопинг', 'Фото-споты'],
    categoryIds: ['restaurants', 'shops', 'transport', 'photo-spots', 'wellness'],
    collectionIds: ['collection-1', 'collection-2'],
    tone: 'coast'
  }
];
