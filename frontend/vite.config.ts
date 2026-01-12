import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0"
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Глушим ворнинги от зависимостей (frappe-gantt) про устаревшие Sass API
        quietDeps: true,
        silenceDeprecations: ["legacy-js-api", "color-functions", "global-builtin"]
      }
    }
  }
});

