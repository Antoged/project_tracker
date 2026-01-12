# Как сделать сайт доступным для других людей

Есть несколько способов открыть доступ к сайту. Выберите подходящий вариант.

## Вариант 1: Локальная сеть (быстро, для тестирования)

Этот способ позволяет открыть сайт другим людям в вашей локальной сети (Wi-Fi).

### Шаг 1: Узнайте IP-адрес вашего компьютера

**В PowerShell:**
```powershell
ipconfig
```

Найдите строку **IPv4 Address** (например, `192.168.1.100`). Это ваш IP-адрес в локальной сети.

### Шаг 2: Настройте backend

Backend уже настроен для работы в сети. Просто запустите его:

```powershell
cd backend
npm run dev
```

### Шаг 3: Настройте frontend

Frontend уже настроен (`host: "0.0.0.0"` в `vite.config.ts`). 

**ВАЖНО:** Нужно изменить адрес API в `frontend/src/api/client.ts`:

Замените:
```typescript
baseURL: "http://localhost:4000/api"
```

На:
```typescript
baseURL: "http://ВАШ_IP:4000/api"  // Замените ВАШ_IP на ваш IP (например, 192.168.1.100)
```

### Шаг 4: Запустите frontend

```powershell
cd frontend
npm run dev
```

Vite покажет адреса:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

### Шаг 5: Откройте файрвол

**В PowerShell (от администратора):**
```powershell
# Разрешить входящие подключения на порт 4000 (backend)
New-NetFirewallRule -DisplayName "Backend API" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow

# Разрешить входящие подключения на порт 5173 (frontend)
New-NetFirewallRule -DisplayName "Frontend Dev" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### Шаг 6: Делитесь адресом

Другие люди в вашей сети могут открыть сайт по адресу:
```
http://ВАШ_IP:5173
```

**Ограничения:**
- Работает только в одной локальной сети (Wi-Fi)
- Ваш компьютер должен быть включен
- Не работает из интернета

---

## Вариант 2: Деплой на хостинг (рекомендуется)

Для постоянного доступа из интернета лучше задеплоить на хостинг.

### Frontend → Vercel (бесплатно)

1. **Установите Vercel CLI:**
```powershell
npm install -g vercel
```

2. **Соберите проект:**
```powershell
cd frontend
npm run build
```

3. **Создайте файл `frontend/vercel.json`:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

4. **Залогиньтесь и задеплойте:**
```powershell
vercel login
vercel
```

5. **Настройте переменные окружения:**
   - В настройках проекта Vercel добавьте переменную:
   - `VITE_API_URL` = `https://ваш-backend-url.com/api`

6. **Обновите `frontend/src/api/client.ts`:**
```typescript
baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api"
```

### Backend → Render (бесплатно)

1. **Создайте аккаунт на [render.com](https://render.com)**

2. **Создайте новый Web Service:**
   - Подключите ваш GitHub репозиторий
   - Выберите папку `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Добавьте переменные окружения в Render:**
   - `PORT` = `4000`
   - `DATABASE_URL` = `ваша_строка_подключения`
   - `JWT_SECRET` = `случайная_строка`
   - `DEV_BYPASS_AUTH` = `false`

4. **Настройте PostgreSQL на Render:**
   - Создайте PostgreSQL базу данных
   - Скопируйте `DATABASE_URL` из настроек базы

5. **Обновите `backend/package.json`:**
Добавьте скрипт для продакшена:
```json
"scripts": {
  "start": "node dist/server.js",
  "build": "tsc"
}
```

### База данных → Render PostgreSQL

1. В Render создайте PostgreSQL базу данных
2. Скопируйте `DATABASE_URL`
3. Используйте его в переменных окружения backend

---

## Вариант 3: Ngrok (быстрое туннелирование)

Для быстрого доступа из интернета без деплоя:

1. **Установите ngrok:**
   - Скачайте с [ngrok.com](https://ngrok.com)
   - Зарегистрируйтесь и получите токен

2. **Запустите backend и frontend локально**

3. **Создайте туннель для frontend:**
```powershell
ngrok http 5173
```

4. **Создайте туннель для backend (в другом терминале):**
```powershell
ngrok http 4000
```

5. **Обновите `frontend/src/api/client.ts`:**
Используйте URL от ngrok для backend (например, `https://abc123.ngrok.io/api`)

6. **Делитесь URL от ngrok для frontend**

**Ограничения бесплатного ngrok:**
- URL меняется при каждом перезапуске
- Ограничение по трафику

---

## Рекомендации

- **Для тестирования:** Вариант 1 (локальная сеть)
- **Для постоянного использования:** Вариант 2 (деплой на хостинг)
- **Для быстрой демонстрации:** Вариант 3 (ngrok)

---

## Безопасность

⚠️ **Важно для продакшена:**

1. Отключите `DEV_BYPASS_AUTH=false` в `.env`
2. Используйте сильный `JWT_SECRET`
3. Настройте CORS правильно (ограничьте домены)
4. Используйте HTTPS (Vercel и Render предоставляют автоматически)
5. Не храните пароли и секреты в коде
