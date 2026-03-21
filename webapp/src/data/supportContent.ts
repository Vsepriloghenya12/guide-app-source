export type ContactChannel = {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  href: string;
  kind: 'telegram' | 'whatsapp' | 'phone' | 'email' | 'instagram';
};

export type EmergencyContact = {
  id: string;
  title: string;
  description: string;
  value: string;
  href: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const contactChannels: ContactChannel[] = [
  {
    id: 'telegram',
    title: 'Telegram',
    subtitle: 'Быстрые вопросы, рекомендации и поддержка по разделам guide.',
    value: '@danangguide_support',
    href: 'https://t.me/danangguide_support',
    kind: 'telegram'
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    subtitle: 'Удобно для быстрых сообщений и отправки локации.',
    value: '+84 90 000 90 90',
    href: 'https://wa.me/84900009090',
    kind: 'whatsapp'
  },
  {
    id: 'phone',
    title: 'Телефон',
    subtitle: 'Срочный звонок, если нужна помощь или уточнение по контакту.',
    value: '+84 90 000 90 90',
    href: 'tel:+84900009090',
    kind: 'phone'
  },
  {
    id: 'email',
    title: 'Email',
    subtitle: 'Для партнёрств, размещения в guide и длинных запросов.',
    value: 'hello@danangguide.app',
    href: 'mailto:hello@danangguide.app',
    kind: 'email'
  },
  {
    id: 'instagram',
    title: 'Instagram',
    subtitle: 'Актуальные анонсы, места дня и подборки для города.',
    value: '@danangguide.app',
    href: 'https://instagram.com/danangguide.app',
    kind: 'instagram'
  }
];

export const emergencyContacts: EmergencyContact[] = [
  {
    id: 'police',
    title: 'Полиция',
    description: 'Экстренная помощь и безопасность.',
    value: '113',
    href: 'tel:113'
  },
  {
    id: 'fire',
    title: 'Пожарная служба',
    description: 'Пожар, задымление, угроза жизни.',
    value: '114',
    href: 'tel:114'
  },
  {
    id: 'ambulance',
    title: 'Скорая помощь',
    description: 'Медицинская экстренная помощь.',
    value: '115',
    href: 'tel:115'
  },
  {
    id: 'tourist-help',
    title: 'Туристическая помощь',
    description: 'Локальная помощь по логистике, утерянным вещам и маршрутам.',
    value: '+84 90 000 90 90',
    href: 'tel:+84900009090'
  }
];

export const helpFaq: FaqItem[] = [
  {
    id: 'how-to-use',
    question: 'Как пользоваться guide-приложением эффективнее всего?',
    answer:
      'Начни с категорий на главной, добавляй понравившиеся места в избранное и включай геолокацию для блока «Рядом». Так приложение начнёт подсказывать, что ближе к тебе именно сейчас.'
  },
  {
    id: 'owner-updates',
    question: 'Как быстро обновляется контент после сохранения в owner-CMS?',
    answer:
      'После сохранения карточек, баннеров и советов изменения уходят на сервер и становятся доступны другим пользователям после обновления данных в приложении. Это уже не локальный редактор в одном браузере.'
  },
  {
    id: 'favorites',
    question: 'Где искать сохранённые места?',
    answer:
      'Сохраняй локации через кнопку «В избранное» в карточке места. Потом открой нижнее меню → «Избранное», и места будут сгруппированы по категориям.'
  },
  {
    id: 'nearby',
    question: 'Почему раздел «Рядом» пустой или показывает мало мест?',
    answer:
      'Для nearby нужны координаты у карточек и доступ к геолокации устройства. Если место ещё без координат, владелец может добавить lat/lng прямо в owner-CMS.'
  },
  {
    id: 'offline',
    question: 'Что будет, если пропадёт интернет?',
    answer:
      'PWA умеет кэшировать оболочку приложения и показывает офлайн-страницу. Последние открытые разделы могут открываться быстрее, но живые данные и поиск всё равно требуют сети.'
  },
  {
    id: 'maps',
    question: 'Как открыть маршрут в удобных картах?',
    answer:
      'В карточке места есть быстрые кнопки Google Maps, Apple Maps и 2GIS. Если у тебя включена геолокация, там же сразу покажется примерное расстояние и время пути.'
  }
];

export const supportQuickLinks = [
  {
    id: 'search',
    title: 'Поиск по guide',
    description: 'Найти место по тегам, кухне, услугам и названию.',
    path: '/search'
  },
  {
    id: 'nearby',
    title: 'Что рядом со мной',
    description: 'Показать ближайшие точки и открыть маршрут.',
    path: '/nearby'
  },
  {
    id: 'events',
    title: 'Скоро в афише',
    description: 'События, вечеринки, мастер-классы и планы на выходные.',
    path: '/section/events'
  },
  {
    id: 'contacts',
    title: 'Связаться с нами',
    description: 'Telegram, WhatsApp, телефон и emergency contacts.',
    path: '/contacts'
  }
];
