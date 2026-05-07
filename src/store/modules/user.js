import { getUserInfo, login } from "@/api/user";
import store2 from "store2";
export default {
  namespaced: true,
  state: {
    info: store2.get("info") || {},
    meuns: store2.get("meuns") || [],
    token: store2.get("token") || "",
    refreshToken: store2.get("refreshToken") || "",
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      store2.add("token", token);
    },
    setRefreshToken(state, refreshToken) {
      state.refreshToken = refreshToken;
      store2.add("refreshToken", refreshToken);
    },
    setInfo(state, info) {
      store2.add("info", info);
    },
    setMeuns(state, meuns) {
      state.meuns = meuns;
      store2.add("meuns", meuns);
    },
  },
  actions: {
    async login({ commit }, payload) {
      console.log(">>>>>payload", payload);
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
      }
      return res.data.info;
    },
  },
};
