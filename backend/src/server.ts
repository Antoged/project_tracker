import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { initDatabase } from "./db/init";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";

const app = express();

app.use(cors({
  origin: [
    "https://project-tracker-rho-five.vercel.app",
    "https://project-tracker-*.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Маршрут ${req.originalUrl} не найден` });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Внутренняя ошибка сервера" });
});

async function start() {
  try {
    await initDatabase();
    app.listen(env.port, "0.0.0.0", () => {
      console.log(`[server] http://localhost:${env.port}`);
      console.log(`[server] Доступен в сети по IP: http://ВАШ_IP:${env.port}`);
    });
  } catch (err) {
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }
}

start();

