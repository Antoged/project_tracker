import axios from "axios";

// Для локального доступа из сети используйте ваш IP вместо localhost
// Например: "http://192.168.1.100:4000/api"
// Узнать IP: ipconfig в PowerShell, найти IPv4 Address
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000
});

// Важно: ставим токен сразу при инициализации, чтобы запросы после refresh не уходили без Authorization
const token = localStorage.getItem("auth_token");
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

