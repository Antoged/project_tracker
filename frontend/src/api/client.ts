import axios from "axios";

// Для локального доступа из сети используйте ваш IP вместо localhost
// Например: "http://192.168.1.100:4000/api"
// Узнать IP: ipconfig в PowerShell, найти IPv4 Address
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000
});

// В dev-режиме бэкенд может быть без токена (DEV_BYPASS_AUTH=true),
// если нужен токен — можно раскомментировать и задать здесь.
// api.defaults.headers.common.Authorization = `Bearer ${token}`;

