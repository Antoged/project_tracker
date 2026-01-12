# Инструкция: Загрузка кода на GitHub

## Шаг 1: Подключите ваш GitHub репозиторий

Выполните в PowerShell (замените на ваш URL репозитория):

```powershell
cd D:\tgbots\mysite

# Подключите ваш GitHub репозиторий (замените URL на ваш!)
git remote add origin https://github.com/ВАШ_USERNAME/ВАШ_РЕПОЗИТОРИЙ.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Загрузите код на GitHub
git push -u origin main
```

**Как узнать URL вашего репозитория:**
1. Откройте ваш репозиторий на GitHub
2. Нажмите зеленую кнопку **"Code"**
3. Скопируйте URL (например: `https://github.com/username/project-tracker.git`)

---

## Шаг 2: Если возникла ошибка авторизации

Если Git просит логин/пароль:

1. **Используйте Personal Access Token вместо пароля:**
   - GitHub больше не принимает пароли через Git
   - Создайте токен: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Нажмите "Generate new token"
   - Выберите срок действия и права: `repo` (все права репозитория)
   - Скопируйте токен (он показывается только один раз!)

2. **При запросе пароля введите токен вместо пароля**

Или используйте GitHub Desktop (проще для новичков):
- Скачайте [desktop.github.com](https://desktop.github.com)
- Откройте репозиторий через GitHub Desktop
- Нажмите "Publish repository"

---

## Шаг 3: Проверьте

Откройте ваш репозиторий на GitHub - там должны быть все файлы проекта!

---

## Что дальше?

После загрузки кода на GitHub:
1. Задеплойте Backend на Render (см. `DEPLOY_INTERNET.md`)
2. Задеплойте Frontend на Vercel (см. `DEPLOY_INTERNET.md`)
