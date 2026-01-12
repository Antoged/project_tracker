import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthPayload {
  userId: string;
  role: "admin" | "user";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (env.devBypassAuth) {
    req.user = { userId: "demo-admin", role: "admin" };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Необходим токен" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Некорректный токен" });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (env.devBypassAuth) {
    req.user = { userId: "demo-admin", role: "admin" };
    return next();
  }
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Требуются права администратора" });
  }
  return next();
};

