import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
} from "vue-router";
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
export default router;
