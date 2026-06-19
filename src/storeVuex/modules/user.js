import { getUserInfo, login, logout } from "@/api/user";
import store2 from "store2";
import { deepTree } from "@/utils";
import { ElMessage } from "element-plus";
import router from "@/router";
export default {
  namespaced: true,
  state: {
    info:  {},
    menus: [],
    token: store2.get("token") || "",
    routes: [],
    permissions:[],
    isAdd: false,
    refreshToken: store2.get("refreshToken") || "",
  },
  mutations: {
    setPermissions(state, permissions) {
      state.permissions = permissions;
    },
    setIsAdd(state, isAdd) {
      state.isAdd = isAdd;
    },
    setToken(state, token) {
      state.token = token;
      store2.add("token", token);
    },
    setRoutes(state, routes) {
      state.routes = routes;
    },
    setRefreshToken(state, refreshToken) {
      store2.add("refreshToken", refreshToken);
      state.refreshToken = refreshToken;
    },
    setInfo(state, info) {
      state.info = info;
    },
    setmenus(state, menus) {
      state.menus = menus;
    },
  },
  actions: {
    async login({ commit }, payload) {
      const res = await login(payload);
      console.log(">>>>>登录", res);
      if (res.code === 1000) {
        commit("setToken", res.data.token);
        commit("setRefreshToken", res.data.refreshToken);
      }
      return res.data;
    },
    async getPerson({ commit }, payload) {
      const res = await getUserInfo();
      if (res.code === 1000) {
        commit("setInfo", res.data.info);
        // 菜单数据
        commit(
          "setmenus",
          deepTree(res.data.menus.filter((item) => item.type != "2")),
        );
        // 路由数据
        let routes = res.data.menus
          .filter((item) => item.type == "1")
          .map((item) => item.router);
        commit("setRoutes", routes);
        // 按钮权限数据
        const perms = res.data.menus.filter(item=>item.type=='2').map(item=>item.perms.split(",")).flat();
        console.log('>>>perms>>',perms);  
        commit("setPermissions", perms);

      }
      return res.data.menus.filter((item) => item.type == "1");
    },
    async logout({ commit }, flag = true) {
      flag && (await logout());
      commit("setIsAdd", false);
      // 清理
      store2.clearAll();
      router.replace("/login");
    },
  },
};
