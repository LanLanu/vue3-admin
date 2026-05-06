import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 路径别名
    alias: {
      // "@": path.resolve(__dirname, "./src"),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
    },
  },
  server: {
    // port: 3000,
    proxy: {
      /**
       * :5173/api  =>  :8001/api
       * :5173/api/hello  =>  :8001/api/hello
       */
      "/api": {
        target: "http://127.0.0.1:8001",
        changeOrigin: true,
        rewrite: (path) => path.replace("/api", ""),
      },
    },
  },
});
