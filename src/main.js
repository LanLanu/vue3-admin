import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import store from "./store";
import "element-plus/dist/index.css";
import "./global.scss";
createApp(App).use(router).use(store).use(ElementPlus).mount("#app");
