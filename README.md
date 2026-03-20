# Guide App — Railway + PostgreSQL + Owner CMS

Рабочая версия городского гида с публичной частью и закрытой owner-CMS.

## Что уже переведено на рабочую схему

- PostgreSQL-архитектура для:
  - `categories`
  - `filters`
  - `listings`
  - `banners`
  - `collections`
  - `collection_items`
- серверная авторизация owner через session cookie
- CRUD карточек из owner-CMS
- статусы карточек: `published` / `hidden` / `draft`
- сортировка и `featured`
- загрузка изображений через owner-CMS
- автоматическое сжатие изображений через `sharp`
- публикация публичных страниц из серверных данных
- глобальный поиск
- избранное пользователя
- детальная карточка места

## Railway env variables

Обязательные:

- `DATABASE_URL`
- `SESSION_SECRET`
- `OWNER_PASSWORD` или `OWNER_PASSWORD_HASH`

Опциональные:

- `UPLOAD_DIR=/data/uploads`
- `DATABASE_SSL=false` — если SSL не нужен

## Storage

Для изображений лучше подключить Railway Volume и смонтировать его в `/data`.
Тогда `UPLOAD_DIR=/data/uploads` будет сохранять файлы между деплоями.

## Локальный запуск

```bash
npm install --workspaces --include=dev
npm run build
npm run start
```

Если `DATABASE_URL` не задан, сервер стартует в memory fallback режиме для локальной проверки интерфейса.

## Owner route

- `/owner-login`
- после входа открывается `/owner`

## Что отложено отдельно

- геолокация и расстояние
- контакты и обратная связь
- финальная PWA-полировка
- SEO и релизная оптимизация


## Railway build note

This project includes a root `.npmrc` with `include=dev` so Vite and TypeScript tooling are available during Railway builds. If your Railway service still has an old cached environment variable forcing production-only installs, set `NPM_CONFIG_PRODUCTION=false` and redeploy.
