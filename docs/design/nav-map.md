# Карта навигации — Груз в рейс

Референс: `carrier-home.png`

## Breakpoints

| Имя | Ширина | Shell |
|-----|--------|-------|
| mobile | `<768` | drawer + bottom tabs |
| tablet | `768–1023` | drawer + bottom tabs |
| desktop | `≥1024` | sidebar + header |

## Sidebar → route → экран

| Пункт меню | Route | Компонент / статус |
|------------|-------|-------------------|
| Главная | `/` | `HomePage` |
| Лента заказов | `/feed` | `Works mode=feed` — только статус «Новый» |
| Мои заказы | `/orders` | Заказчик: `Cargos`. Исполнитель: `Works mode=mine` — отклики + в работе |
| Финансы | `/finance` | `WalletPage` |
| Чат | `/chats`, `/chats/:id` | `Chats` / `ChatsList` |
| Мои машины | `/vehicles` | `TransportEditPage` |
| Поддержка | `/support` | Stub |
| Документы | `/documents` | Stub (соглашения) |
| Настройки | `/settings` | `Settings` |
| Профиль | `/profile` | `Cabinet` |
| Верификация | `/verification` | Stub + checklist |
| Партнёрам | `/partners` | Stub |

## Legacy redirects

| Старый | Новый |
|--------|-------|
| `/tab1` | `/orders` или `/feed` по роли |
| `/tab2` | `/chats` |
| `/tab3` | `/settings` |
| `/tab4` | `/orders` (архив позже) |
| `/cabinet` | `/profile` |
