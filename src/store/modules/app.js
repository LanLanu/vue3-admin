export default {
  namespaced: true,
  state: {
    collapsed: false,
  },
  mutations: {
    setCollapsed(state, payload) {
      state.collapsed = payload;
    },
  },
  actions: {
    changeCollpased({ commit }, payload) {
      commit("setCollapsed", payload);
    },
  },
};
