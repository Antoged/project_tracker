import { useState, useEffect, useCallback } from "react";
import { User, login as loginApi, register as registerApi } from "../api/auth";
import { api } from "../api/client";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Загружаем сохраненные данные при загрузке
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        // Устанавливаем токен в заголовки
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      } catch (e) {
        // Если ошибка парсинга, очищаем
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await loginApi({ email, password });
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      api.defaults.headers.common.Authorization = `Bearer ${response.token}`;
      setUser(response.user);
      return response;
    } catch (err: any) {
      console.error("Login error:", err);
      throw err;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      const response = await registerApi({ email, password, displayName });
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      api.defaults.headers.common.Authorization = `Bearer ${response.token}`;
      setUser(response.user);
      return response;
    } catch (err: any) {
      console.error("Register error:", err);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};
