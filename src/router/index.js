import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/modules/user";
import routerStatic from "./statisRouter";
import nprogress from "nprogress";
//引入进度条样式
import "nprogress/nprogress.css";
// https://www.npmjs.com/package/nprogress
nprogress.configure({ showSpinner: false });
// 动态导入组件模块        /**/表示深层搜索
const modules = import.meta.glob("../views/**/*.vue", { eager: false });
console.log(">>>>>modules", modules); // ../views/customDirective/index.vue: () => import("/src/views/customDirective/index.vue")
// 数组写法 ：import.meta.glob(["../views/**/*.vue","!../views/**/components/*.vue"], { eager: false });  ！表示排除
const router = createRouter({
  history: createWebHistory(),
  routes: routerStatic,
});
// 路由拦截白名单
const whiteName = ["login", "403", "404"];
router.beforeEach(async (to, from) => {
  nprogress.start();
  const userStore = useUserStore();
  // 1. 白名单直接放行
  if (whiteName.includes(to.name)) {
    return true;
  }
  // 2. 登录校验
  const token = userStore.token;
  if (!token) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  // 3. 动态添加路由
  const isAdd = userStore.isAdd;
  if (!isAdd) {
    userStore.isAdd = true;
    const routes = await userStore.getPerson();
    routes.forEach((item) => {
      if (item.router == "/bigScreen") {
        router.addRoute({
          path: item.router,
          component: modules[`../${item.viewPath}`],
        });
      } else {
        router.addRoute("index", {
          path: item.router,
          component: modules[`../${item.viewPath}`],
        });
      }
    });
    // 关键一步：路由添加后，中断当前导航，重新进入一次
    // 这样 Vue Router 会重新进行路由匹配，就能找到刚刚添加的动态路由了
    return { ...to, replace: true };
  }

  // 4. 权限校验和404处理
  // 当代码执行到这里，说明动态路由已经添加完毕
  // 此时，to.matched 是一个空数组，就代表没有找到任何匹配的路由（包括静态和动态）
  if (to.matched.length === 0) {
    return { name: "404" };
  }
  return true;
});
//全局后置守卫
router.afterEach(() => {
  nprogress.done();
});
export default router;
