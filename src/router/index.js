import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/login/index.vue"),
    },
    {
      path: "/",
      name: "index",
      component: () => import("../layout/index.vue"),
      children: [
        {
          path: "/dashboard/console",
          name: "dashboard_console",
          component: () => import("../views/dashboard/console.vue"),
        },
        {
          path: "/dashboard/workplace",
          name: "dashboard_workplace",
          component: () => import("../views/dashboard/workplace.vue"),
        },
        {
          path: "/dashboard/monitor",
          name: "dashboard_monitor",
          component: () => import("../views/dashboard/monitor.vue"),
        },
      ],
    },
  ],
});
// 路由拦截白名单
const whiteName = ["login"];
router.beforeEach((to, from, next) => {
  if (!whiteName.includes(to.name)) {
    // 登录校验
    const token = store.state.user.token;
    if (!token) {
      return next({ name: "login", query: { redirect: to.fullPath } });
    }
  }
  return next();
});
export default router;
