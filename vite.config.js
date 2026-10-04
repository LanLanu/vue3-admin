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
      // 浠呯敓浜х幆澧冨惎鐢ㄧЩ闄ゆ帶鍒跺彴
      createHtmlPlugin({
        // HTML鍘嬬缉閰嶇疆锛屼粎鐢熶骇鐜鐢熸晥
        minify: {
          // HTML鍘嬬缉閰嶇疆锛堢敓浜х敓鏁堬級
          removeComments: true, // 鍒犻櫎html娉ㄩ噴
          keepClosingSlash: true,
          minifyJS: true, // 鍘嬬缉html鍐呰仈script js
          collapseWhitespace: true, // 鍒犻櫎绌烘牸鎹㈣
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          useShortDoctype: true,
          minifyCSS: true, // 鍘嬬缉html鍐呰仈style閲岀殑css
        },
      }),
    ],
    resolve: {
      // 璺緞鍒悕
      alias: {
        // "@": path.resolve(__dirname, "./src"),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        // "utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      },
    },

    server: {
      // port: 3000, // 鏈湴鍚姩鑷畾涔夌鍙ｅ彿
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
      outDir: "prod", // 淇敼涓轰綘鎯宠鐨勬枃浠跺す鍚嶇О,
      sourcemap: false, // 涓嶇敓鎴恠ourcemap鏄犲皠鏂囦欢銆俿ourcemap鐢ㄦ潵绾夸笂杩樺師鍘嬬缉鍚庣殑浠ｇ爜锛涘叧闂彲浠?*澶у箙鍑忓皯鍖呬綋绉?*锛岀敓浜х幆澧冧竴鑸叧鎺?      // vite鐢熶骇鎵撳寘榛樿寮€鍚痗ss鍘嬬缉锛岃繖閲屽彲浠ュ崟鐙寚瀹氬帇缂╁櫒
      cssMinify: "lightningcss", // lightningcss鍘嬬缉鐜囨洿濂斤紝vite榛樿浣跨敤
      minify: "terser", // JS鍘嬬缉锛宱xc鎬ц兘鏈€濂斤紱鍙€?terser銆愬繀鍔犮€戝垏鎹㈠帇缂╁櫒涓簍erser锛宼erserOptions鎵嶇敓鏁?JS浠ｇ爜鍘嬬缉銆佸垹闄や唬鐮?      // cssCodeSplit: true, // css鎷嗗垎鐙珛鏂囦欢
      assetsInlineLimit: 4096, // 榛樿4kb锛屽皬浜?kb杞琤ase64
      // 寮€鍚?Gzip / Brotli 鍘嬬缉锛?*nginx鏈嶅姟鍣ㄧ**
      terserOptions: {
        compress: {
          // 鎵撳寘鏃舵竻闄?console 鍜?debug 鐩稿叧浠ｇ爜
          drop_console: true, // 鍒犻櫎浠ｇ爜閲屾墍鏈塩onsole.*鏃ュ織
          drop_debugger: true, // 鍒犻櫎debugger鏂偣
        },
      },
      rollupOptions: {
        // 杈撳嚭閰嶇疆
        output: {
          // 鎹㈡垚鍑芥暟鍐欐硶锛侊紒
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
          // 杈撳嚭鐨勬枃浠惰嚜瀹氫箟鍛藉悕
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
