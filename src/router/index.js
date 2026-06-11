import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
import routerStatic from "./statisRouter";
// 动态导入组件模块        /**/表示深层搜索
const modules = import.meta.glob("../views/**/*.vue", { eager: false });  
console.log('>>>>>modules',modules);  // ../views/customDirective/index.vue: () => import("/src/views/customDirective/index.vue")
// 数组写法 ：import.meta.glob(["../views/**/*.vue","!../views/**/components/*.vue"], { eager: false });  ！表示排除
const router = createRouter({
  history: createWebHistory(),
  routes: routerStatic,
});
// 路由拦截白名单
const whiteName = ["login", "403", "404"];
router.beforeEach(async (to, from) => {
  // TODO 面包屑
  // console.log(">>>>>toto", to);
  if (!whiteName.includes(to.name)) {
    // 登录校验
    const token = store.state.user.token;
    if (!token) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
    // 动态添加路由
    const isAdd = store.state.user.isAdd;
    if (!isAdd) {
      store.commit("user/setIsAdd", true);
      const routes = await store.dispatch("user/getPerson");
      routes.forEach((item) => {
        router.addRoute("index", {
          path: item.router,
          // TODO 本地引入可以，产品环境引入不了报错 因为找不到文件
          // component: () => import(`../${item.viewPath}`),
            // 动态导入
            component: modules[`../${item.viewPath}`],
        });
      });
      // 触发重定向
      return to.fullPath;
    }
    // // 路由权限
    // const routes = store.state.user.routes;
    // if (!routes.includes(to.path) && to.name != "index") {
    //   console.log(">>>>>无权访问");
    //   // 无权访问
    //   return { name: "403" }; // 正确 name
    // }
  }
  return true;
});
export default router;
