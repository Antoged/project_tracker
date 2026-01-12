import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
  // По умолчанию true для разработки, если не задано явно
  devBypassAuth: process.env.DEV_BYPASS_AUTH !== "false"
};

if (!env.databaseUrl) {
  // Логируем предупреждение, чтобы не падать на старте при отсутствии .env
  // Настоящие проверки можно усилить в продакшене.
  console.warn("[env] DATABASE_URL не задан. Проверьте backend/.env");
}

