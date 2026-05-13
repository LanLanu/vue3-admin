import { getUserInfo, login, logout } from "@/api/user";
import store2 from "store2";
import { deepTree } from "@/utils";
export default {
  namespaced: true,
  state: {
    info: store2.get("info") || {},
    menus: store2.get("menus") || [],
    token: store2.get("token") || "",
    routes: store2.get("routes") || "",
    refreshToken: store2.get("refreshToken") || "",
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      store2.add("token", token);
    },
    setRoutes(state, routes) {
      state.routes = routes;
      store2.add("routes", routes);
    },
    setRefreshToken(state, refreshToken) {
      state.refreshToken = refreshToken;
      store2.add("refreshToken", refreshToken);
    },
    setInfo(state, info) {
      state.info = info;
      store2.add("info", info);
    },
    setmenus(state, menus) {
      state.menus = menus;
      store2.add("menus", menus);
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
        commit(
          "setRoutes",
          res.data.menus.filter((item) => item.type == "1"),
        );
      }
      return res.data.info;
    },
    async logout({ commit }, payload) {
      const res = await logout();
      return res.data;
    },
  },
};
