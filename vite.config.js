import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { createHtmlPlugin } from "vite-plugin-html";
const timeStamp = new Date().getTime();
// https://vite.dev/config/
// 鍑芥暟
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
      createHtmlPlugin({
        minify: {
          removeComments: true,
          keepClosingSlash: true,
          minifyJS: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          minifyCSS: true,
        },
      }),
    ],
    resolve: {
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
        "/api/bigFileUpload": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace("/api/bigFileUpload", ""),
        },
        "/api/chartroom": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace("/api/chartroom", ""),
        },
        /**
         * 聊天室 REST 接口代理
         * :5173/api/chat/messages => :3000/chat/messages
         * （rewrite 保留 /chat 前缀，匹配后端路由挂载路径）
         */
        "/api/chat": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
        "/api": {
          target: "http://127.0.0.1:8001",
          changeOrigin: true,
          rewrite: (path) => path.replace("/api", ""),
        },
        "/ws": {
          target: "https://apis.map.qq.com",
          changeOrigin: true,
        },
        "/agnes-api": {
          // target: "https://api.agnes-ai.cn",
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/agnes-api/, "/v1"),
        },
      },
    },
    build: {
      outDir: "prod",
      sourcemap: false,
      cssMinify: "lightningcss",
      minify: "terser",
      assetsInlineLimit: 4096,
      terserOptions: {
        // compress: {
        //   drop_console: true,
        //   drop_debugger: true,
        // },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            const modulesPath = id.split("node_modules/")[1];
            if (!modulesPath) return;
            const pkgName = modulesPath.split("/")[0];
            if (pkgName === "vue") return "vue";
            if (pkgName === "lodash" || pkgName === "axios") return "vendor";
          },
          // manualChunks(id) {
          //   if (id.includes("node_modules/vue")) {
          //     return "vue";
          //   }
          //   if (
          //     id.includes("node_modules/lodash") ||
          //     id.includes("node_modules/axios")
          //   ) {
          //     return "vendor";
          //   }
          // },
          chunkFileNames: `js/[name]-[hash].${timeStamp}.js`,
          entryFileNames: `js/[name]-[hash].${timeStamp}.js`, // 鎺у埗鍏朵粬璧勬簮锛堟瘮濡?CSS銆佸浘鐗囩瓑锛夌殑鍛藉悕
          assetFileNames: `assets/[name]-[hash].${timeStamp}.[ext]`, // [ext] 鏄枃浠舵墿灞曞悕
        },
      },
    },
  };
});
// 閰嶇疆椤?// export default defineConfig({
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
//     // 璺緞鍒悕
//     alias: {
//       // "@": path.resolve(__dirname, "./src"),
//       "@": fileURLToPath(new URL("./src", import.meta.url)),
//       // "utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
//     },
//   },
//   // TODO 鏂囦欢鎸囩汗
//   server: {
//     // port: 3000, // 鏈湴鍚姩鑷畾涔夌鍙ｅ彿
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
//     outDir: "prod", // 淇敼涓轰綘鎯宠鐨勬枃浠跺す鍚嶇О,
//     sourcemap: false, // 涓嶇敓鎴?source map
//     terserOptions: {
//       compress: {
//         // 鎵撳寘鏃舵竻闄?console 鍜?debug 鐩稿叧浠ｇ爜
//         drop_console: true,
//         drop_debugger: true,
//       },
//     },
//     rollupOptions: {
//       // 杈撳嚭閰嶇疆
//       output: {
//         // 杈撳嚭鐨勬枃浠惰嚜瀹氫箟鍛藉悕
//         chunkFileNames: `js/[name]-[hash].${timeStamp}.js`,
//         entryFileNames: `js/[name]-[hash].${timeStamp}.js`, // 鎺у埗鍏朵粬璧勬簮锛堟瘮濡?CSS銆佸浘鐗囩瓑锛夌殑鍛藉悕
//         assetFileNames: `assets/[name]-[hash].${timeStamp}.[ext]`, // [ext] 鏄枃浠舵墿灞曞悕
//       },
//     },
//   },
// });
