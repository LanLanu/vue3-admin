import { createRouter, createWebHistory } from "vue-router";
import store from "@/store";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "登录",
      component: () => import("../views/login/index.vue"),
    },
    {
      path: "/",
      name: "Dashboard",
      component: () => import("../layout/index.vue"),
      children: [
        {
          path: "/dashboard/console",
          name: "主控台",
          component: () => import("../views/dashboard/console.vue"),
        },
        {
          path: "/dashboard/workplace",
          name: "工作台",
          component: () => import("../views/dashboard/workplace.vue"),
        },
        {
          path: "/dashboard/monitor",
          name: "监控台",
          component: () => import("../views/dashboard/monitor.vue"),
        },
        {
          path: "/system/menu",
          name: "菜单列表",
          component: () => import("../views/system/menu/index.vue"),
        },
        {
          path: "/system/user",
          name: "用户列表",
          component: () => import("../views/system/user/index.vue"),
        },
        {
          path: "/system/role",
          name: "角色列表",
          component: () => import("../views/system/role/index.vue"),
        },
      ],
    },
  ],
});
// 路由拦截白名单
const whiteName = ["login"];
router.beforeEach((to, from, next) => {
  // TODO 面包屑
  console.log(">>>>>toto", to);
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
