
# ✨ PromptAGG — Внутренний сервис генерации промтов

Веб-сервис для команды «МНС-Обувь», предназначенный для ведения контент-плана и автоматической сборки сложных ТЗ (промтов) для нейросетей NanoBanana и QwenChat.

---

# 🏗 Архитектура проекта

Проект построен по принципу монорепозитория:

PromptAGG/
│
├── backend/   # FastAPI (Python) + SQLModel + PostgreSQL
└── frontend/  # React (Vite) + Tailwind CSS

---

# 🛠 Установка и запуск

## 1. Бэкенд (Python)

Все библиотеки для бэкенда устанавливаются строго внутри виртуального окружения в папке backend.

Путь:
PromptAGG/backend/

### Перейди в папку

cd backend

### Создай и активируй виртуальное окружение

python -m venv venv

Windows:
venv\Scripts\activate

Mac / Linux:
source venv/bin/activate

### Установи зависимости

pip install -r requirements.txt

Основные библиотеки:
fastapi, sqlmodel, uvicorn, python-dotenv, psycopg2-binary

### Запуск сервера

uvicorn app.main:app --reload

---

## 2. Фронтенд (Node.js)

Зависимости фронтенда устанавливаются через npm в папку node_modules внутри frontend.

Путь:
PromptAGG/frontend/

### Перейди в папку

cd ../frontend

### Установи пакеты

npm install

Ключевые пакеты:
axios (для связи с бэком), lucide-react (иконки), tailwindcss

### Запуск в режиме разработки

npm run dev

---

# ⚙️ Настройка окружения

Для работы базы данных и связи с API создай файлы .env

backend/.env

DATABASE_URL=postgresql://user:pass@localhost:5432/promptagg

frontend/.env

VITE_API_URL=http://127.0.0.1:8000

---

# 🚀 Следующие шаги

[x] Инициализация моделей БД (SQLModel)
[x] Настройка сервисов генерации (Text & Media)
[ ] Реализация React-интерфейса
[ ] Деплой на Railway

---

Совет по разработке:

Если используешь VS Code, убедись, что при работе с файлами бэкенда выбран интерпретатор из папки backend/venv/bin/python,
иначе IDE будет подсвечивать импорты sqlmodel красным.

