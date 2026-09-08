import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
const timeStamp = new Date().getTime();
// https://vite.dev/config/
// 函数
export default defineConfig(({ mode }) => {
  const isProd = mode === "development";
  console.log(">>>>isProd>", isProd);
  return {
    base: "/",
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      // 仅生产环境启用移除控制台
    ],
    resolve: {
      // 路径别名
      alias: {
        // "@": path.resolve(__dirname, "./src"),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        // "utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      },
    },

    server: {
      // port: 3000, // 本地启动自定义端口号
      proxy: {
        /**
         * :5173/api  =>  :8001/api
         * :5173/api/hello  =>  :8001/api/hello
         */
        "/api/bigFileUpload": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace("/api/bigFileUpload", ""),
        },
        "/api": {
          target: "http://127.0.0.1:8001",
          changeOrigin: true,
          rewrite: (path) => path.replace("/api", ""),
        },
        "/ws": {
          target: "https://apis.map.qq.com",
          changeOrigin: true,
          // rewrite: (path) => path.replace("/api", ""),
        },
      },
    },
    build: {
      outDir: "prod", // 修改为你想要的文件夹名称,
      sourcemap: false, // 不生成 source map
      terserOptions: {
        compress: {
          // 打包时清除 console 和 debug 相关代码
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        // 输出配置
        output: {
          // 输出的文件自定义命名
          chunkFileNames: `js/[name]-[hash].${timeStamp}.js`,
          entryFileNames: `js/[name]-[hash].${timeStamp}.js`, // 控制其他资源（比如 CSS、图片等）的命名
          assetFileNames: `assets/[name]-[hash].${timeStamp}.[ext]`, // [ext] 是文件扩展名
        },
      },
    },
  };
});
// 配置项
// export default defineConfig({
//   plugins: [
//     vue(),
//     AutoImport({
//       resolvers: [ElementPlusResolver()],
//     }),
//     Components({
//       resolvers: [ElementPlusResolver()],
//     }),
//   ],
//   resolve: {
//     // 路径别名
//     alias: {
//       // "@": path.resolve(__dirname, "./src"),
//       "@": fileURLToPath(new URL("./src", import.meta.url)),
//       // "utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
//     },
//   },
//   // TODO 文件指纹
//   server: {
//     // port: 3000, // 本地启动自定义端口号
//     proxy: {
//       /**
//        * :5173/api  =>  :8001/api
//        * :5173/api/hello  =>  :8001/api/hello
//        */
//       "/api": {
//         target: "http://127.0.0.1:8001",
//         changeOrigin: true,
//         rewrite: (path) => path.replace("/api", ""),
//       },
//       "/ws": {
//         target: "https://apis.map.qq.com",
//         changeOrigin: true,
//         // rewrite: (path) => path.replace("/api", ""),
//       },
//     },
//   },
//   build: {
//     outDir: "prod", // 修改为你想要的文件夹名称,
//     sourcemap: false, // 不生成 source map
//     terserOptions: {
//       compress: {
//         // 打包时清除 console 和 debug 相关代码
//         drop_console: true,
//         drop_debugger: true,
//       },
//     },
//     rollupOptions: {
//       // 输出配置
//       output: {
//         // 输出的文件自定义命名
//         chunkFileNames: `js/[name]-[hash].${timeStamp}.js`,
//         entryFileNames: `js/[name]-[hash].${timeStamp}.js`, // 控制其他资源（比如 CSS、图片等）的命名
//         assetFileNames: `assets/[name]-[hash].${timeStamp}.[ext]`, // [ext] 是文件扩展名
//       },
//     },
//   },
// });
