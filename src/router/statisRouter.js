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
];
