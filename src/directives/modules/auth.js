/**
 * 按钮权限指令
    v-auth="'add'"
 */
import { useUserStore } from "@/store/modules/user";
const auth = {
  mounted(el, binding) {
    const userStore = useUserStore();
    const permissions = userStore.permissions;
    if (!permissions.includes(binding.value)) {
      el.parentNode.removeChild(el);
    }
  },
};
export default auth;
