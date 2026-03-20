# Guide App

Стартовый каркас большого guide-приложения с отдельным frontend и backend.

## Что уже есть
- React + TypeScript + Vite frontend
- PWA-подготовка для установки на телефон
- Отдельный backend на Express для Railway
- Главная страница
- Разделы:
  - Рестораны, кафе и столовые
  - СПА и оздоровление
- Отдельная страница владельца
- Нижнее меню
- Адаптивный дизайн под телефон, планшет и ПК

## Структура
- `webapp` — интерфейс приложения
- `server` — backend и раздача собранного frontend на Railway

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


## Railway
- Деплой из корня репозитория.
- `railway.toml` уже добавлен в проект и принудительно ставит workspace-зависимости с `--include=dev` перед сборкой.
- В Railway можно оставить Build Command и Start Command пустыми: настройки возьмутся из `railway.toml`.
- После пуша деплой последнего коммита предпочтительнее обычного redeploy.
