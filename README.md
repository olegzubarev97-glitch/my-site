# In Balance Nutrition — Fullstack Application

## Обзор проекта

Премиальный продающий лендинг для сервиса доставки рационов питания **in balance nutrition** (г. Казань). Fullstack приложение на React + tRPC + Drizzle ORM + MySQL.

### Стек
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + GSAP
- **Backend:** Hono + tRPC 11 + Drizzle ORM
- **Database:** MySQL 8
- **Auth:** Kimi OAuth 2.0 (JWT сессии)

### Архитектура

```
app/
├── src/                    # Frontend
│   ├── sections/           # Секции лендинга (Hero, Rations, FAQ и тд)
│   ├── pages/              # Страницы (Home, Admin, Login)
│   ├── components/         # Компоненты (Navigation, OrderForm, Admin managers)
│   ├── hooks/              # React hooks (useAuth, useContentMap)
│   ├── providers/          # TRPCProvider
│   └── config/             # Константы, иконки, конфигурация
├── api/                    # Backend tRPC routers
│   ├── router.ts         # Главный роутер
│   ├── ration-router.ts    # CRUD рационов
│   ├── lead-router.ts      # Заявки с сайта
│   ├── content-router.ts   # Редактируемый контент
│   ├── config-router.ts    # Глобальные настройки
│   └── gallery-router.ts   # Галерея изображений
├── db/                     # Database schema + seed
│   ├── schema.ts           # Drizzle схема
│   └── seed.ts             # Начальные данные
├── contracts/              # Shared types/constants
├── public/images/          # Сгенерированные изображения
├── docker-compose.yml      # Docker Compose для DB + App
└── Dockerfile              # Production build
```

## Быстрый старт

### Локальная разработка

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка базы данных (.env уже создан init.sh)
# Убедитесь что DATABASE_URL корректен

# 3. Push схемы и seed
npm run db:push
npx tsx db/seed.ts

# 4. Запуск dev сервера
npm run dev
# Откройте http://localhost:3000
```

### Docker (рекомендуется для production)

```bash
# Запуск всего стека
docker-compose up -d

# Применить миграции в контейнере
docker-compose exec app npx drizzle-kit push
docker-compose exec app npx tsx db/seed.ts
```

### Production деплой

```bash
# Сборка
npm run build

# Запуск production сервера
npm start
# Сервер слушает порт 3000
```

## Структура базы данных

| Таблица | Назначение |
|---------|-----------|
| `users` | Пользователи (OAuth) |
| `rations` | Рационы питания (SLIM, FIT, SPORT, MASS) |
| `leads` | Заявки с сайта |
| `siteContent` | Редактируемый контент лендинга |
| `siteConfig` | Глобальные настройки (телефон, соцсети) |
| `galleryImages` | Изображения галереи |

## tRPC API

### Публичные эндпоинты
- `ration.list` — список активных рационов
- `content.getAll` — весь контент сайта
- `config.getAll` — все настройки
- `gallery.list` — активные изображения галереи
- `lead.create` — отправка заявки

### Защищенные эндпоинты (admin)
- `ration.adminList/create/update/delete`
- `lead.list/updateStatus/delete`
- `content.update`
- `config.update`
- `gallery.adminList/create/update/delete`

## Админ-панель

Доступна по адресу `/admin`. Требует роль `admin`.

**Как получить админ доступ:**
1. Войдите через OAuth (/login)
2. В базе данных обновите роль пользователя:
   ```sql
   UPDATE users SET role = 'admin' WHERE id = YOUR_USER_ID;
   ```

**Возможности админки:**
- **Обзор:** статистика заявок и рационов
- **Рационы:** CRUD — создание, редактирование, удаление рационов
- **Заявки:** таблица с фильтрацией по статусу, смена статуса
- **Контент:** редактирование всех текстов на лендинге
- **Галерея:** добавление/удаление/сортировка изображений
- **Настройки:** телефон, соцсети, город и другие параметры

## Редактируемый контент

Все текстовки на лендинге загружаются из БД через `siteContent`. Ключи контента:

| Ключ | Секция | Описание |
|------|--------|----------|
| `hero_title` | hero | Главный заголовок |
| `hero_subtitle` | hero | Подзаголовок |
| `pain_1_title` | pain | Боль #1 заголовок |
| `trust_1_title` | trust | Преимущество #1 |
| `founder_name` | founder | Имя основателя |
| `faq_1_q` | faq | Вопрос FAQ #1 |
| `cta_title` | cta | Заголовок финального CTA |

## Добавление нового функционала

### 1. Новая таблица БД
```typescript
// db/schema.ts
export const newTable = mysqlTable("newTable", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

### 2. Синхронизация схемы
```bash
npm run db:push
```

### 3. tRPC Router
```typescript
// api/new-router.ts
export const newRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(newTable);
  }),
});

// api/router.ts
export const appRouter = createRouter({
  // ...existing routers
  newThing: newRouter,
});
```

### 4. Frontend
```typescript
const { data } = trpc.newThing.list.useQuery();
```

## Миграции

```bash
# Development (быстрая синхронизация)
npm run db:push

# Production (генерация SQL)
npm run db:generate
npm run db:migrate
```

**Важно:** Никогда не используйте `db:push --force` на production — это может удалить данные.

## AI Agent Guide

Если вы агент ИИ, вот что нужно знать для изменения проекта:

1. **Все бизнес-данные в БД** — рационы, контент, настройки управляются через админку
2. **Статичные файлы** — только изображения в `public/images/`, конфиг иконок в `src/config/siteConfig.ts`
3. **Добавление секции** — создайте файл в `src/sections/`, импортируйте в `Home.tsx`
4. **Изменение стилей** — используйте Tailwind, цвета в дизайн-системе (sage green `#6B7B5E`, beige `#F5F1EB`)
5. **Backend изменения** — добавляйте роутеры в `api/`, регистрируйте в `api/router.ts`
6. **Не перезаписывайте** `api/lib/`, `api/kimi/`, `src/providers/trpc.tsx`, `.env`

## Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev сервер с HMR |
| `npm run build` | Production сборка |
| `npm start` | Production сервер |
| `npm run check` | TypeScript проверка |
| `npm run db:push` | Синхронизация схемы |
| `npx tsx db/seed.ts` | Заполнение данными |

## Контакты и ссылки

- **Instagram бренда:** https://www.instagram.com/inbalancenutrion
- **Instagram основателя:** https://www.instagram.com/zubarevoleg_kzn
- **Город:** Казань
