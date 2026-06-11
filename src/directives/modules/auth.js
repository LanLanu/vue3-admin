/**
 * 按钮权限指令
    v-auth="'add'"
 */
import store from "@/store";
const auth = {
    mounted(el,binding){
        const permissions =store.state.user.permissions;
        if(!permissions.includes(binding.value)){
            el.parentNode.removeChild(el);
        }
    }
}
export default auth;