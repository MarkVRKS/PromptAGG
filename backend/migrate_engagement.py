#!/usr/bin/env python3
"""
Миграция: добавление поля engagement_level в таблицу posts_plan_v3
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv(os.path.join(os.path.dirname(__file__), 'app', '.env'))

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:123@localhost:5432/promptagg')

def run_migration():
    print("🔄 Запуск миграции: добавление engagement_level...")

    engine = create_engine(DATABASE_URL)

    try:
        with engine.connect() as conn:
            # Добавляем колонку, если её ещё нет
            conn.execute(text("""
                ALTER TABLE posts_plan_v3
                ADD COLUMN IF NOT EXISTS engagement_level VARCHAR(20);
            """))
            conn.commit()
            print("✅ Миграция успешно применена!")
            print("   Поле 'engagement_level' добавлено в таблицу 'posts_plan_v3'")
    except Exception as e:
        print(f"❌ Ошибка при выполнении миграции: {e}")
        sys.exit(1)
    finally:
        engine.dispose()

if __name__ == "__main__":
    run_migration()
