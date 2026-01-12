import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { pool } from "../db/pool";
import { User } from "../types";
import { nowIso } from "../utils/time";

const router = Router();

const createToken = (user: User) =>
  jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: "7d"
  });

router.post("/register", async (req, res) => {
  const { email, password, displayName, username } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email и пароль обязательны" });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: "Пароль должен быть минимум 8 символов" });
  }
  if (!username || !String(username).trim()) {
    return res.status(400).json({ message: "Никнейм обязателен" });
  }
  const normalizedUsername = String(username).trim().toLowerCase();
  if (!/^[a-z0-9_]{3,32}$/.test(normalizedUsername)) {
    return res.status(400).json({ message: "Никнейм: 3-32 символа, латиница/цифры/подчёркивание" });
  }

  const normalizedEmail = String(email).toLowerCase();
  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Пользователь уже существует" });
    }
    const existingUsername = await client.query("SELECT id FROM users WHERE username = $1", [normalizedUsername]);
    if (existingUsername.rows.length > 0) {
      return res.status(409).json({ message: "Никнейм уже занят" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = normalizedEmail;

    // Первый зарегистрированный пользователь становится admin (чтобы можно было управлять проектами).
    // Остальные — user.
    const countResult = await client.query("SELECT COUNT(*)::int AS cnt FROM users");
    const usersCount = Number(countResult.rows?.[0]?.cnt ?? 0);
    const userRole = usersCount === 0 ? "admin" : "user";
    const userName = displayName || normalizedUsername;

    await client.query(
      "INSERT INTO users (id, email, username, password_hash, display_name, role) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, normalizedEmail, normalizedUsername, passwordHash, userName, userRole]
    );

    const user: User = {
      id: userId,
      email: normalizedEmail,
      username: normalizedUsername,
      displayName: userName,
      role: userRole,
      passwordHash
    };

    return res.status(201).json({
      token: createToken(user),
      user: { id: user.id, email: user.email, username: user.username, role: user.role, displayName: user.displayName }
    });
  } catch (err) {
    console.error("[auth] Register error:", err);
    return res.status(500).json({ message: "Ошибка регистрации" });
  } finally {
    client.release();
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email и пароль обязательны" });
  }

  const normalizedEmail = String(email).toLowerCase();
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT id, email, username, password_hash, display_name, role FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const row = result.rows[0];
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Неверный пароль" });
    }

    const user: User = {
      id: row.id,
      email: row.email,
      username: row.username,
      displayName: row.display_name,
      role: row.role,
      passwordHash: row.password_hash
    };

    return res.json({
      token: createToken(user),
      user: { id: user.id, email: user.email, username: user.username, role: user.role, displayName: user.displayName },
      lastLoginAt: nowIso()
    });
  } catch (err) {
    console.error("[auth] Login error:", err);
    return res.status(500).json({ message: "Ошибка входа" });
  } finally {
    client.release();
  }
});

export default router;

