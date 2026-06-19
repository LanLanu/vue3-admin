import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
/**
 * 完整引入
 */
// import ElementPlus from "element-plus";
// import "element-plus/dist/index.css";
// import zhCn from 'element-plus/es/locale/lang/zh-cn'
/**
 * 按需引入 (api函数引用式)Elemssage、message-box、 notification组件,
 */
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/notification/style/css";
import "element-plus/es/components/message-box/style/css";
import { createPinia } from "pinia";
const pinia = createPinia();
import "./global.scss";
// import waterMarker from "@/directives/modules/waterMarker.js"
// import draggable from "./directives/modules/draggable";
// import auth from "./directives/modules/auth";
import directives from "./directives";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
const app = createApp(App);
app.use(directives);
// app.directive("waterMarker",waterMarker)
// app.directive("draggable",draggable)
// app.directive("auth",auth)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
// app.use(ElementPlus, {
//   locale: zhCn,
// })
app.use(pinia);
app.use(router);
app.mount("#app");
