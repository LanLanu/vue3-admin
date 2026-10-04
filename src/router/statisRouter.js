export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/login/index.vue'),
  },

  {
    path: '/',
    name: 'index',
    component: () => import('../layout/index.vue'),
    redirect: '/dashboard/console',
    children: [
      {
        path: '/agent',
        name: 'agent',
        component: () => import('@/views/agent/index.vue'),
      },
      {
        path: '/chartroom',
        name: 'chartroom',
        component: () => import('@/views/chartroom/index.vue'),
      },
      {
        path: '/403',
        name: '403',
        component: () => import('@/views/error/403.vue'),
      },
      {
        path: '/404',
        name: '404',
        component: () => import('@/views/error/404.vue'),
      },
    ],
  },
];
