# Проектный трекер (React + Express + PostgreSQL, TypeScript)

Минимальный каркас сервиса для управления проектами с этапами, блокировкой последующих этапов, учётом времени и диаграммой Ганта. Стек: **React + MUI + TypeScript** (frontend), **Express + TypeScript + PostgreSQL** (backend). Скрипты и инструкции адаптированы под Windows.

## Структура
- `frontend/` — React + Vite + MUI, минималистичный UI с градиентами и стартовым экраном проектов.
- `backend/` — Express API, Postgres (pg), JWT-авторизация, базовые сущности: пользователи, проекты, этапы.
- `backend/env.sample` — пример переменных окружения для backend.

## Требования
- Node.js 18+ (Windows).
- PostgreSQL (локально или в Docker).

## Подробная инструкция по запуску (Windows)

### Шаг 1: Установка Node.js

1. Если Node.js не установлен:
   - Скачайте с [nodejs.org](https://nodejs.org/) (версия 18 или выше)
   - Установите, следуя инструкциям установщика
   - Проверьте установку в PowerShell:
   ```powershell
   node --version
   npm --version
   ```
   Должны отобразиться версии (например, `v20.11.0` и `10.2.4`)

### Шаг 2: Установка PostgreSQL

1. Если PostgreSQL не установлен:
   - Скачайте с [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
   - Установите, запомните пароль для пользователя `postgres`
   - При установке выберите порт по умолчанию: `5432`

2. Проверьте, что PostgreSQL запущен:
   - Откройте "Службы" (Win+R → `services.msc`)
   - Найдите "postgresql-x64-XX" и убедитесь, что статус "Выполняется"

### Шаг 3: Создание базы данных

Откройте PowerShell и выполните:

**Вариант А: Через psql (если он в PATH)**
```powershell
# Подключитесь к PostgreSQL (введите пароль пользователя postgres)
psql -U postgres

# В открывшейся консоли PostgreSQL выполните:
CREATE DATABASE project_tracker;

# Проверьте создание:
\l

# Выйдите:
\q
```

**Вариант Б: Через pgAdmin (графический интерфейс)**
1. Откройте pgAdmin (устанавливается вместе с PostgreSQL)
2. Подключитесь к серверу PostgreSQL (введите пароль)
3. Правой кнопкой на "Databases" → "Create" → "Database"
4. Имя: `project_tracker`
5. Нажмите "Save"

**Вариант В: Через SQL команду напрямую**
```powershell
# Замените YOUR_PASSWORD на ваш пароль postgres
psql -U postgres -c "CREATE DATABASE project_tracker;"
```

### Шаг 4: Клонирование/подготовка проекта

Если проект уже скачан, переходите к следующему шагу. Если нет:
```powershell
# Перейдите в папку проекта
cd D:\tgbots\mysite
```

### Шаг 5: Установка зависимостей backend

```powershell
# Перейдите в папку backend
cd backend

# Установите зависимости (может занять 1-2 минуты)
npm install

# Вернитесь в корень проекта
cd ..
```

**Что происходит:** npm скачивает все необходимые пакеты (`express`, `pg`, `typescript` и т.д.) в папку `node_modules`.

### Шаг 6: Установка зависимостей frontend

```powershell
# Перейдите в папку frontend
cd frontend

# Установите зависимости (может занять 1-2 минуты)
npm install

# Вернитесь в корень проекта
cd ..
```

### Шаг 7: Настройка переменных окружения

1. Скопируйте файл-пример:
   ```powershell
   copy backend\env.sample backend\.env
   ```

2. Откройте файл `backend\.env` в любом текстовом редакторе (Notepad, VS Code и т.д.)

3. Отредактируйте строку `DATABASE_URL`:
   ```
   DATABASE_URL=postgres://postgres:ВАШ_ПАРОЛЬ@localhost:5432/project_tracker
   ```
   
   **Примеры:**
   - Если пароль `mypass123`: `DATABASE_URL=postgres://postgres:mypass123@localhost:5432/project_tracker`
   - Если другой пользователь: `DATABASE_URL=postgres://username:password@localhost:5432/project_tracker`
   - Если другой порт: `DATABASE_URL=postgres://postgres:password@localhost:5433/project_tracker`

4. Сохраните файл (Ctrl+S)

### Шаг 8: Запуск backend сервера

Откройте **первое окно PowerShell**:

```powershell
# Перейдите в папку backend
cd D:\tgbots\mysite\backend

# Запустите сервер в режиме разработки
npm run dev
```

**Ожидаемый вывод:**
```
[db] Schema initialized
[server] http://localhost:4000
```

**Если видите ошибку подключения к БД:**
- Проверьте, что PostgreSQL запущен
- Проверьте правильность `DATABASE_URL` в `backend\.env`
- Убедитесь, что база `project_tracker` создана

**Оставьте это окно открытым** — сервер должен работать постоянно.

### Шаг 9: Запуск frontend

Откройте **второе окно PowerShell** (новое окно, не закрывая первое):

```powershell
# Перейдите в папку frontend
cd D:\tgbots\mysite\frontend

# Запустите dev сервер
npm run dev
```

**Ожидаемый вывод:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Шаг 10: Открытие приложения

1. Откройте браузер (Chrome, Edge, Firefox)
2. Перейдите по адресу: **http://localhost:5173**
3. Должен открыться интерфейс проектного трекера

### Проверка работы

1. **Backend работает:** Откройте http://localhost:4000/health в браузере — должно вернуться `{"ok":true,"time":"..."}`
2. **Frontend работает:** Откройте http://localhost:5173 — должен открыться интерфейс
3. **База данных:** При первом запуске backend автоматически создаст таблицы (вы увидите `[db] Schema initialized`)

### Остановка серверов

Чтобы остановить серверы:
- В окнах PowerShell нажмите **Ctrl+C**
- Подтвердите остановку, если потребуется

### Быстрый старт (если всё уже установлено)

Если Node.js и PostgreSQL уже установлены и настроены:

```powershell
# 1. Установка зависимостей
cd backend && npm install && cd ../frontend && npm install && cd ..

# 2. Настройка .env (если ещё не настроен)
copy backend\env.sample backend\.env
# Отредактируйте backend\.env

# 3. Запуск backend (в первом окне)
cd backend
npm run dev

# 4. Запуск frontend (во втором окне)
cd frontend
npm run dev
```

## Переменные окружения (backend)

Файл `backend/.env` должен содержать:

```
PORT=4000
DATABASE_URL=postgres://postgres:ВАШ_ПАРОЛЬ@localhost:5432/project_tracker
JWT_SECRET=supersecret
DEV_BYPASS_AUTH=true
```

**Важно:**
- `PORT` — порт, на котором будет работать backend (по умолчанию 4000)
- `DATABASE_URL` — строка подключения к PostgreSQL в формате: `postgres://пользователь:пароль@хост:порт/база_данных`
- `JWT_SECRET` — секретный ключ для подписи токенов (можно оставить `supersecret` для разработки)
- `DEV_BYPASS_AUTH` — для локальной разработки можно оставить `true`, чтобы не настраивать токены; в проде выключите.

**Формат DATABASE_URL:**
- `postgres://` — протокол
- `postgres` — имя пользователя (обычно `postgres`)
- `:` — разделитель
- `ВАШ_ПАРОЛЬ` — пароль пользователя PostgreSQL
- `@localhost` — хост (обычно `localhost`)
- `:5432` — порт PostgreSQL (по умолчанию 5432)

---

## Как открыть сайт для других людей

### Вариант 1: Локальная сеть (быстро, для тестирования)

Этот способ позволяет открыть сайт другим людям в вашей локальной сети (Wi-Fi).

#### Шаг 1: Узнайте IP-адрес вашего компьютера

**В PowerShell:**
```powershell
ipconfig
```

Найдите строку **IPv4 Address** (например, `192.168.1.100`). Это ваш IP-адрес в локальной сети.

#### Шаг 2: Настройте API URL

Создайте файл `frontend/.env`:
```env
VITE_API_URL=http://ВАШ_IP:4000/api
```

Замените `ВАШ_IP` на ваш IP (например, `192.168.1.100`).

#### Шаг 3: Откройте файрвол

**В PowerShell (от администратора):**
```powershell
# Разрешить входящие подключения на порт 4000 (backend)
New-NetFirewallRule -DisplayName "Backend API" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow

# Разрешить входящие подключения на порт 5173 (frontend)
New-NetFirewallRule -DisplayName "Frontend Dev" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

#### Шаг 4: Запустите серверы

Запустите backend и frontend как обычно. После запуска frontend покажет:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

#### Шаг 5: Делитесь адресом

Другие люди в вашей сети могут открыть сайт по адресу:
```
http://ВАШ_IP:5173
```

**Ограничения:**
- Работает только в одной локальной сети (Wi-Fi)
- Ваш компьютер должен быть включен
- Не работает из интернета

### Вариант 2: Деплой на хостинг (для постоянного доступа)

Для постоянного доступа из интернета лучше задеплоить на хостинг.

**Frontend → Vercel (бесплатно):**
1. Установите Vercel CLI: `npm install -g vercel`
2. Соберите проект: `cd frontend && npm run build`
3. Задеплойте: `vercel`
4. Настройте переменную окружения `VITE_API_URL` в настройках проекта

**Backend → Render (бесплатно):**
1. Создайте аккаунт на [render.com](https://render.com)
2. Создайте Web Service, подключите GitHub репозиторий
3. Выберите папку `backend`
4. Добавьте переменные окружения (PORT, DATABASE_URL, JWT_SECRET)
5. Создайте PostgreSQL базу данных на Render

**Подробная инструкция:** См. файл `DEPLOY.md` (если создан)

### Вариант 3: Ngrok (быстрое туннелирование)

Для быстрого доступа из интернета без деплоя:

1. Установите ngrok с [ngrok.com](https://ngrok.com)
2. Запустите backend и frontend локально
3. Создайте туннель: `ngrok http 5173`
4. Обновите `frontend/src/api/client.ts` с URL от ngrok для backend
5. Делитесь URL от ngrok

**Ограничения:** URL меняется при каждом перезапуске (бесплатный план)
- `/project_tracker` — имя базы данных

## Ключевые возможности MVP
- Проекты с этапами (3–7+ шагов).
- Блокировка следующего этапа, пока предыдущий не завершён.
- Учёт времени статусов этапа (старт/финиш, длительность).
- Роли: админ / пользователь (админ создаёт и назначает).
- Диаграмма Ганта на фронте (библиотека `frappe-gantt` через React-обёртку).
- Современный UI: градиенты, скругления, тёмная/светлая тема.

## Команды
### backend
- `npm run dev` — запуск в режиме разработки (ts-node-dev).
- `npm run build` — сборка в `dist/`.
- `npm start` — запуск собранной версии.

### frontend
- `npm run dev` — запуск Vite dev server.
- `npm run build` — сборка в `dist/`.
- `npm run preview` — предпросмотр сборки.

## Решение проблем

### Ошибка: "Cannot find module 'pg'"
**Решение:** Выполните `npm install` в папке `backend`

### Ошибка: "password authentication failed"
**Решение:** 
- Проверьте правильность пароля в `DATABASE_URL`
- Убедитесь, что пользователь `postgres` существует и пароль верный
- Попробуйте подключиться через pgAdmin для проверки

### Ошибка: "database 'project_tracker' does not exist"
**Решение:** Создайте базу данных (см. Шаг 3)

### Ошибка: "connect ECONNREFUSED 127.0.0.1:5432"
**Решение:**
- Убедитесь, что PostgreSQL запущен (проверьте в "Службы")
- Проверьте, что порт в `DATABASE_URL` правильный (по умолчанию 5432)

### Ошибка: "EADDRINUSE: address already in use :::4000"
**Решение:** Порт 4000 занят. Измените `PORT` в `backend/.env` на другой (например, 4001)

### Backend запускается, но таблицы не создаются
**Решение:**
- Проверьте, что файл `backend/src/db/schema.sql` существует
- Проверьте права доступа к БД (пользователь должен иметь права на создание таблиц)
- Посмотрите логи в консоли backend — там должна быть ошибка

### Frontend не подключается к backend
**Решение:**
- Убедитесь, что backend запущен на порту 4000
- Проверьте, что в `frontend/src/api/client.ts` правильный URL (должен быть `http://localhost:4000`)
- Проверьте CORS настройки в backend (должен быть включен)

### "npm: command not found"
**Решение:** Node.js не установлен или не добавлен в PATH. Переустановите Node.js с официального сайта

## Схема базы данных

При первом запуске backend автоматически создаст таблицы из `backend/src/db/schema.sql`:
- `users` — пользователи (id, email, password_hash, role, display_name, created_at)
- `projects` — проекты (id, name, created_at, updated_at)
- `stages` — этапы проектов (id, project_id, title, order, status, assignee_id, started_at, finished_at, created_at)

**Проверка таблиц:**
```powershell
psql -U postgres -d project_tracker -c "\dt"
```
Должны отобразиться три таблицы: `users`, `projects`, `stages`.

## Краткая шпаргалка команд

### Первый запуск (один раз)
```powershell
# 1. Создать БД
psql -U postgres -c "CREATE DATABASE project_tracker;"

# 2. Настроить .env
copy backend\env.sample backend\.env
# Отредактировать backend\.env

# 3. Установить зависимости
cd backend && npm install && cd ../frontend && npm install
```

### Ежедневный запуск
```powershell
# Окно 1: Backend
cd backend
npm run dev

# Окно 2: Frontend
cd frontend
npm run dev
```

### Полезные команды
```powershell
# Проверить версию Node.js
node --version

# Проверить версию PostgreSQL
psql --version

# Проверить таблицы в БД
psql -U postgres -d project_tracker -c "\dt"

# Очистить node_modules и переустановить (если проблемы)
cd backend && rmdir /s /q node_modules && npm install
cd ../frontend && rmdir /s /q node_modules && npm install
```

### Адреса после запуска
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **Health check:** http://localhost:4000/health

## Дальнейшие шаги
- Добавить валидацию входных данных (например, через Zod или Joi).
- Расширить экран проекта (детализированные карточки этапов, фильтры, поиск, назначение исполнителей).
- Добавить уведомления и историю изменений.
- Настроить деплой (Vercel для фронта, Render/Railway для бэкенда).

