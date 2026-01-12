import axios from "axios";

// Для локального доступа из сети используйте ваш IP вместо localhost
// Например: "http://192.168.1.100:4000/api"
// Узнать IP: ipconfig в PowerShell, найти IPv4 Address
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000
});

// Обработка ошибок 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Удаляем токен и данные пользователя
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      delete api.defaults.headers.common.Authorization;
      // Перезагружаем страницу для показа экрана входа
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

