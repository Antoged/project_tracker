-- Migration: add users.username (unique) and project membership roles

-- 1) Add username column if missing
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(64);

-- Backfill usernames for existing users if null/empty (stable + unique)
UPDATE users
SET username = 'user_' || substring(md5(id), 1, 10)
WHERE username IS NULL OR btrim(username) = '';

-- Normalize to lowercase
UPDATE users
SET username = lower(username)
WHERE username <> lower(username);

-- Ensure uniqueness with index (case-insensitive by storing lower)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username);

-- Enforce NOT NULL after backfill
ALTER TABLE users
ALTER COLUMN username SET NOT NULL;

-- 2) Project members table
CREATE TABLE IF NOT EXISTS project_members (
  project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'executor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);

-- 3) Backfill membership for existing projects to avoid "empty visibility".
-- We assign the earliest created user as admin for all existing projects (one admin per project).
WITH first_user AS (
  SELECT id
  FROM users
  ORDER BY created_at ASC
  LIMIT 1
)
INSERT INTO project_members (project_id, user_id, role)
SELECT p.id, fu.id, 'admin'
FROM projects p
CROSS JOIN first_user fu
ON CONFLICT (project_id, user_id) DO NOTHING;

