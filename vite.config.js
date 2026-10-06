import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue"; // Vue 单文件组件（.vue）编译支持
import * as path from "node:path";
import { fileURLToPath } from "node:url"; // 将 ESM 中的 URL 转为系统路径
import AutoImport from "unplugin-auto-import/vite"; // 自动导入 API（ref、computed、ElMessage 等），无需手动 import
import Components from "unplugin-vue-components/vite"; // 自动注册组件（如 Element Plus），模板中直接使用
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"; // Element Plus 解析器，配合上面两个插件按需加载
import { createHtmlPlugin } from "vite-plugin-html"; // 处理 index.html：支持变量注入、HTML 压缩
const timeStamp = new Date().getTime(); // 构建时戳，附加到文件名，防止浏览器缓存旧资源

// https://vite.dev/config/
// 使用函数形式以便根据 mode 区分开发/生产环境
export default defineConfig(({ mode }) => {
  // 判断是否生产环境（vite build 时 mode 为 "production"）
  const isProd = mode === "production";
  console.log(">>>>isProd>", isProd);
  return {
    base: "/", // 部署的子路径前缀，"/" 表示部署在域名根目录

    plugins: [
      vue(), // 启用 Vue 编译器

      AutoImport({
        resolvers: [ElementPlusResolver()], // 自动导入 Element Plus 的 API（如 ElMessage、ElLoading）
      }),
      Components({
        resolvers: [ElementPlusResolver()], // 自动注册 Element Plus 组件（如 el-button），无需手动 import
      }),
      // HTML 压缩优化：减小 index.html 体积
      createHtmlPlugin({
        minify: {
          removeComments: true, // 移除 HTML 注释
          keepClosingSlash: true, // 保留自闭合标签的斜杠（如 <br/>）
          minifyJS: true, // 压缩内联 JS
          collapseWhitespace: true, // 折叠多余空白
          removeRedundantAttributes: true, // 移除冗余属性（如 <img alt="">）
          removeScriptTypeAttributes: true, // 移除 <script type="text/javascript"> 的 type
          removeStyleLinkTypeAttributes: true, // 移除 <link>/<style> 的 type 属性
          useShortDoctype: true, // 使用短文档类型声明 <!DOCTYPE html>
          minifyCSS: true, // 压缩内联 CSS
        },
      }),
    ],

    resolve: {
      alias: {
        // 路径别名：import 中可用 @ 代替相对路径（如 @/components → src/components）
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    // ===== 开发服务器配置（vite dev） =====
    server: {
      // port: 3000, // 自定义端口号，默认 5173
      // 开发代理：本地请求转发到后端，解决跨域问题
      proxy: {
        /**
         * 大文件上传接口代理
         * :5173/api/bigFileUpload/*  →  :3000/*（去掉 /api/bigFileUpload 前缀）
         */
        "/api/bigFileUpload": {
          target: "http://127.0.0.1:3000", // 后端服务地址
          changeOrigin: true, // 将请求头 Host 改为 target 地址（代理后端需要）
          rewrite: (path) => path.replace("/api/bigFileUpload", ""),
        },

        /**
         * 聊天室 Socket.IO 代理
         * :5173/api/chartroom/*  →  :3000/*
         */
        "/api/chartroom": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace("/api/chartroom", ""),
        },

        /**
         * 聊天室 REST 接口代理
         * :5173/api/chat/messages  →  :3000/chat/messages
         * （rewrite 保留 /chat 前缀，匹配后端路由挂载路径）
         */
        "/api/chat": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },

        /**
         * 通用 API 接口代理（兜底规则，须放在最精确的前缀之后）
         * :5173/api/*  →  :8001/*（去掉 /api 前缀）
         */
        "/api": {
          target: "http://127.0.0.1:8001",
          changeOrigin: true,
          rewrite: (path) => path.replace("/api", ""),
        },

        /**
         * 腾讯地图 WebSocket 代理
         * 本地 :5173/ws  →  https://apis.map.qq.com
         */
        "/ws": {
          target: "https://apis.map.qq.com",
          changeOrigin: true,
        },

        /**
         * Agnes AI 接口代理
         * :5173/agnes-api/*  →  :3000/v1/*
         */
        "/agnes-api": {
          // target: "https://api.agnes-ai.cn", // 线上 AI 接口
          target: "http://127.0.0.1:3000", // 本地 Mock/代理服务
          changeOrigin: true,
          secure: false, // 允许 HTTPS 自签名证书（调试用）
          rewrite: (path) => path.replace(/^\/agnes-api/, "/v1"),
        },
      },
    },

    // ===== 生产构建配置（vite build） =====
    build: {
      outDir: "prod", // 构建产物输出目录
      sourcemap: false, // 不生成 source map，减小线上体积
      cssMinify: "lightningcss", // 使用 LightningCSS 压缩 CSS（比默认 esbuild 更快）
      minify: "terser", // 使用 terser 压缩 JS（压缩率比 esbuild 更高）
      assetsInlineLimit: 4096, // 小于 4KB 的静态资源内联为 base64，减少 HTTP 请求数
      // terser 压缩选项
      terserOptions: {
        compress: {
          drop_console: true, // 移除所有 console 语句
          drop_debugger: true, // 移除 debugger 语句
        },
      },
      rollupOptions: {
        output: {
          // 手动分包：将第三方库拆成独立 chunk，利用浏览器长期缓存
          // vue 单独一块；lodash/axios 合并为 vendor；其余保持默认
          manualChunks(id) {
            if (!id.includes("node_modules")) return; // 只处理第三方依赖
            const modulesPath = id.split("node_modules/")[1];
            if (!modulesPath) return;
            const pkgName = modulesPath.split("/")[0]; // 取包名（如 vue、lodash）
            if (pkgName === "vue") return "vue";
            if (pkgName === "lodash" || pkgName === "axios") return "vendor";
          },
          // 输出文件命名：带 hash + 构建时戳，内容变更时文件名变化，破坏浏览器缓存
          chunkFileNames: `js/[name]-[hash].${timeStamp}.js`, // 分包命名
          entryFileNames: `js/[name]-[hash].${timeStamp}.js`, // 入口文件命名
          assetFileNames: `assets/[name]-[hash].${timeStamp}.[ext]`, // 其他静态资源（CSS、图片等）命名，[ext] 为扩展名
        },
      },
    },
  };
});
