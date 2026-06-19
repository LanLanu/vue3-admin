import { defineStore } from "pinia";
export const useAppStore = defineStore("app", {
  state: () => {
    return {
      collapsed: false,
    };
  },
  actions: {
    async changeCollpased(collapsed) {
      this.collapsed = collapsed;
    },
  },
});
