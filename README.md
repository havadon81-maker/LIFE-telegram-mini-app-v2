# LIFE — Telegram Mini App

MVP персонального трекера жизни. Это не игра: пиксельный стиль используется только как визуальный язык.

## Деплой на Vercel

1. Создай GitHub repository.
2. Загрузи все файлы этого проекта в корень репозитория.
3. В Vercel выбери `Add New → Project` и импортируй repository.
4. Framework Preset: Vite.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Нажми Deploy.
8. Полученный `https://...vercel.app` подключи к Telegram через BotFather.

Проект не использует deprecated `@telegram-apps/*` пакеты. Telegram WebApp API вызывается безопасно через `window.Telegram.WebApp`.

## Подключение к Telegram

В BotFather:
- `/mybots`
- выбери бота
- `Bot Settings`
- `Menu Button`
- `Configure menu button`
- вставь URL Vercel.

Для отдельного Mini App можно также создать Web App в настройках бота и указать тот же URL.

## Данные

MVP сохраняет цели и привычки в `localStorage` браузера/Telegram WebView. Серверная авторизация и облачная база будут следующим этапом.