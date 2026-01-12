import { pool } from "./pool";
import { readFileSync } from "fs";
import { join } from "path";

export async function initDatabase() {
  const client = await pool.connect();
  try {
    // Определяем правильный путь: если запускаем из backend/, то используем src/db, иначе backend/src/db
    const cwd = process.cwd();
    const isInBackend = cwd.endsWith("backend");
    const schemaPath = isInBackend
      ? join(cwd, "src", "db", "schema.sql")
      : join(cwd, "backend", "src", "db", "schema.sql");
    
    const schema = readFileSync(schemaPath, "utf-8");
    await client.query(schema);
    
    // Применяем миграцию для добавления notes, если таблица уже существует
    try {
      const migratePath = isInBackend
        ? join(cwd, "src", "db", "migrate-add-notes.sql")
        : join(cwd, "backend", "src", "db", "migrate-add-notes.sql");
      const migrate = readFileSync(migratePath, "utf-8");
      await client.query(migrate);
    } catch (migrateErr) {
      // Игнорируем ошибки миграции (поле может уже существовать)
    }
    
    console.log("[db] Schema initialized");
  } catch (err) {
    console.error("[db] Failed to initialize schema:", err);
    throw err;
  } finally {
    client.release();
  }
}

