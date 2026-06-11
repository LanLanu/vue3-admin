export default [
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
      // 自定义指令 
      {
        path: "/customDirective",
        name: "自定义指令",
        component: () => import("@/views/customDirective/index.vue"),
      },
      // 403 无权限页
      {
        path: "/403",
        name: "403",
        component: () => import("@/views/error/403.vue"),
      },
      // 404 无权限页
      {
        path: "/404",
        name: "404",
        component: () => import("@/views/error/404.vue"),
      },
      // 404 必须放路由最底部 匹配静态路由和动态路由之外的
      // // TODO router4和router3有区别
      // {
      //   path: "/:pathMatch(.*)*",
      //   name: "404",
      //   component: () => import("../views/error/404.vue"),
      // },
    ],
  },
];
