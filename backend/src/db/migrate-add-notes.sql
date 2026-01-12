-- Миграция: добавление поля notes в таблицу stages
-- Выполните этот SQL если таблица уже создана без поля notes

ALTER TABLE stages ADD COLUMN IF NOT EXISTS notes TEXT;

