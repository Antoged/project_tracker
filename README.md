# Проектный трекер (React + Express + PostgreSQL, TypeScript)

Минимальный каркас сервиса для управления проектами с этапами, блокировкой последующих этапов, учётом времени и диаграммой Ганта. Стек: **React + MUI + TypeScript** (frontend), **Express + TypeScript + PostgreSQL** (backend).

## Структура
- `frontend/` — React + Vite + MUI, минималистичный UI с градиентами и стартовым экраном проектов.
- `backend/` — Express API, Postgres (pg), JWT-авторизация, базовые сущности: пользователи, проекты, этапы.
- `backend/env.sample` — пример переменных окружения для backend.

## Требования
- Node.js 18+
- PostgreSQL

## Ключевые возможности MVP
- Проекты с этапами (3–7+ шагов).
- Блокировка следующего этапа, пока предыдущий не завершён.
- Учёт времени статусов этапа (старт/финиш, длительность).
- Роли: админ / исполнитель (на уровне проекта).
- Диаграмма Ганта на фронте (библиотека `frappe-gantt` через React-обёртку).
- Современный UI: градиенты, скругления, glassmorphism, анимированные элементы.

## Команды
### backend
- `npm run dev` — запуск в режиме разработки (ts-node-dev).
- `npm run build` — сборка в `dist/`.
- `npm start` — запуск собранной версии.

### frontend
- `npm run dev` — запуск Vite dev server.
- `npm run build` — сборка в `dist/`.
- `npm run preview` — предпросмотр сборки.

## Схема базы данных

При первом запуске backend автоматически создаст таблицы из `backend/src/db/schema.sql`:
- `users` — пользователи (id, email, username, password_hash, role, created_at)
- `projects` — проекты (id, name, created_at, updated_at)
- `stages` — этапы проектов (id, project_id, title, order, status, started_at, finished_at, created_at)
- `project_members` — участники проектов (project_id, user_id, role: admin/executor)

## Дальнейшие шаги
- Добавить валидацию входных данных (например, через Zod или Joi).
- Расширить экран проекта (детализированные карточки этапов, фильтры, поиск).
- Добавить уведомления и историю изменений.

