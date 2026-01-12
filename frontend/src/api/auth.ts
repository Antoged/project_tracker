import { api } from "./client";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
  role?: "admin" | "user";
}

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/login", payload);
  return res.data;
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/register", payload);
  return res.data;
};
