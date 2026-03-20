# Guide App

Рабочая версия guide-приложения с поэтапным переходом от localStorage к серверному хранению данных.

## Что уже есть
- React + TypeScript + Vite frontend
- Отдельный backend на Express для Railway
- Главная страница
- Разделы:
  - Рестораны, кафе и столовые
  - СПА и оздоровление
- Отдельная страница владельца
- Нижнее меню
- Адаптивный дизайн под телефон, планшет и ПК
- Первый этап серверной архитектуры данных:
  - backend API для контента
  - PostgreSQL на Railway через `DATABASE_URL`
  - автоматическое создание таблиц и стартовое заполнение
  - fallback в memory-режим, если база пока не подключена

## Структура
- `webapp` — интерфейс приложения
- `server` — backend и раздача собранного frontend на Railway

## Таблицы текущего этапа
Сервер автоматически создаёт:
- `guide_categories`
- `guide_restaurants`
- `guide_wellness`
- `guide_home_content`

На этом этапе уже добавлены:
- server-side owner auth через cookie-сессию
- статусы карточек `published / hidden / draft`
- порядок показа `sortOrder`
- флаг `featured` / «показывать в топе»
- дополнительные поля карточек: телефон, сайт, часы работы, теги
- управление блоками главной страницы из owner-CMS

## Установка
```bash
npm install
```

## Разработка
```bash
npm run dev
```
- frontend: `http://localhost:5173`
- backend: `http://localhost:8080`

Во время локальной разработки Vite автоматически проксирует `/api` на backend.

## Railway / PostgreSQL
Для Railway достаточно добавить переменную окружения:

```bash
DATABASE_URL=postgresql://...
```

Если `DATABASE_URL` не задан, сервер запустится в fallback-режиме с данными в памяти. Это полезно для локальной проверки, но не для постоянного хранения.

## Сборка
```bash
npm run build
npm run start
```

## Лого
Положите свой логотип в `webapp/public/` под одним из этих имён:
- `logo.svg`
- `logo.png`
- `logo.jpg`
- `logo.jpeg`

Приоритет загрузки такой: `svg -> png -> jpg -> jpeg`. Если ни одного файла нет, приложение покажет встроенную заглушку.

Сейчас используется заглушка `logo-placeholder.svg`.

## PWA
Для установки на телефон уже добавлены:
- `manifest.webmanifest`
- service worker `sw.js`
- иконки-заглушки

Потом можно заменить иконки на брендовые.


## Railway Variables

Для закрытого owner-входа добавь переменную окружения `OWNER_PASSWORD`.

Дополнительно можно указать:
- `DATABASE_URL` — строка подключения PostgreSQL Railway
- `PORT` — Railway задаёт сам автоматически

Если `OWNER_PASSWORD` не задан, проект использует временный пароль `guide2026`. Для боевого режима его лучше всегда переопределять в Railway Variables.
