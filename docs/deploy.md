# Деплой сайта «Груз в рейс»

## Сборка

```bash
# Полная проверка типов (в репо есть legacy TS-ошибки вне web-shell)
npm run build

# Статика для хостинга (рекомендуется пока tsc не починен)
npx vite build
```

Артефакты: каталог `dist/`.

## Хостинг

1. Залить содержимое `dist/` на CDN / nginx / S3+CloudFront.
2. Для SPA настроить fallback на `index.html` (все маршруты `/feed`, `/chats/:id` и т.д.).
3. API и Socket.IO сейчас указывают на `https://gruzreis.ru` — при отдельном домене проверить CORS и cookie/token.

## Проверка после выкладки

- [ ] Логин в браузере
- [ ] Главная (dashboard) на desktop ≥1024
- [ ] Sidebar / роль Исполнитель↔Заказчик
- [ ] Чат realtime
- [ ] Загрузка фото через file input
- [ ] Мобильный viewport `<768` (drawer + нижние табы)
