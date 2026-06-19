import { defineStore } from "pinia";
import store2 from "store2";
import { deepTree } from "@/utils";
import router from "@/router";
import { getUserInfo, login, logout } from "@/api/user";
export const useUserStore = defineStore("user", {
  state: () => {
    return {
      token: store2.get("token") || "",
      refreshToken: store2.get("refreshToken") || "",
      info: {},
      menus: [],
      routes: [],
      permissions: [],
      isAdd: false,
    };
  },
  actions: {
    async login(payload) {
      const res = await login(payload);
      console.log(">>>>>登录", res);
      if (res.code === 1000) {
        this.token = res.data.token;
        this.refreshToken = res.data.refreshToken;
        store2.add("token", this.token);
        store2.add("refreshToken", this.refreshToken);
      }
      return res.data;
    },
    async getPerson(payload) {
      const res = await getUserInfo();
      if (res.code === 1000) {
        this.info = res.data.info;
        // 菜单数据
        this.menus = deepTree(
          res.data.menus.filter((item) => item.type != "2"),
        );
        // 路由数据
        this.routes = res.data.menus
          .filter((item) => item.type == "1")
          .map((item) => item.router);
        // 按钮权限数据
        this.permissions = res.data.menus
          .filter((item) => item.type == "2")
          .map((item) => item.perms.split(","))
          .flat();
      }
      return res.data.menus.filter((item) => item.type == "1");
    },
    async logout(flag = true) {
      flag && (await logout());
      this.isAdd = false;
      // 清理
      store2.clearAll();
      router.replace("/login");
    },
  },
});
