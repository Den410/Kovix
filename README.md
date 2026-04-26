# 🎬 Kovix — Платформа для рецензування та пошуку фільмів

[![Pipeline Status](https://git.ztu.edu.ua/@ipz224_ddo/kovix/badges/main/pipeline.svg)](https://git.ztu.edu.ua/@ipz224_ddo/kovix/-/pipelines)
[![Coverage](https://git.ztu.edu.ua/@ipz224_ddo/kovix/badges/main/coverage.svg)](https://git.ztu.edu.ua/@ipz224_ddo/kovix/-/jobs)


## 📝 Опис проєкту
**Kovix** — це сучасний Full-Stack веб-застосунок для кіноманів. Платформа дозволяє користувачам знаходити інформацію про фільми, переглядати трейлери, залишати власні рецензії, а також спілкуватися з друзями та отримувати сповіщення в режимі реального часу.

## 🛠 Технологічний стек

**Backend:**
- **Фреймворк:** .NET 8.0 (ASP.NET Core Web API)
- **База даних:** Microsoft SQL Server 2022
- **ORM:** Entity Framework Core
- **Real-time зв'язок:** SignalR (WebSockets)
- **Аутентифікація:** JWT (JSON Web Tokens)

**Frontend:**
- **Бібліотека:** React 18
- **Збірка:** Vite
- **HTTP клієнт:** Axios
- **Роутинг:** React Router DOM

**Інфраструктура & DevOps:**
- **Контейнеризація:** Docker, Docker Compose
- **Веб-сервер:** Nginx
- **CI/CD:** GitLab CI (`git.ztu.edu.ua`)

## 🚀 Швидкий старт (Локальний запуск)

Проєкт повністю контейнеризований. Для запуску вам потрібен лише встановлений **Docker** та **Docker Desktop**.

**1. Клонування репозиторію:**
```bash
git clone [https://git.ztu.edu.ua/@ipz224_ddo/kovix.git](https://git.ztu.edu.ua/@ipz224_ddo/kovix.git)
cd kovix