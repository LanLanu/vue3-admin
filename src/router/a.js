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
      router.addRoute("index", {
        path: item.router,
        component: modules[`../${item.viewPath}`],
      });
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

  // // 如果你还有其他的权限校验逻辑，可以放在这里
  // const routes = userStore.routes;
  // if (!routes.includes(to.path) && to.name != "index") {
  //   return { name: "403" };
  // }

  return true;
});
// ------------------------------------
router.beforeEach(async (to, from) => {
  nprogress.start();
  const userStore = useUserStore();
  // TODO 面包屑
  if (!whiteName.includes(to.name)) {
    // 登录校验
    const token = userStore.token;
    if (!token) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
    // 动态添加路由
    const isAdd = userStore.isAdd;
    if (!isAdd) {
      userStore.isAdd = true;
      console.log(">>>>>获取信息");
      const routes = await userStore.getPerson();
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
    // const routes = userStore.routes;
    // if (!routes.includes(to.path) && to.name != "index") {
    //   console.log(">>>>>无权访问");
    //   // 无权访问
    //   return { name: "403" }; // 正确 name
    // }
  }
  return true;
});
