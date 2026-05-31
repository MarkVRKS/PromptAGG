-- Добавление поля engagement_level в таблицу posts_plan_v3
ALTER TABLE posts_plan_v3 ADD COLUMN IF NOT EXISTS engagement_level VARCHAR(20);
