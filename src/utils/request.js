/**
 * 封装axios
 *
 *  */
import axios from "axios";
import { ElMessage } from "element-plus";
import store2 from "store2";
import router from "@/router";
import { getToken, setToken } from "@/utils/index";
import { refreshToken } from "@/api/user";
import { useUserStore } from "@/store/modules/user";
const instance = axios.create({
  // TODO 处理本地生产环境变量
  // baseURL: "/api",
  baseURL: import.meta.env.VITE_API_BASEURL,
  timeout: 3 * 1000, // 请求超时3秒
});
/**
 * 添加请求拦截器
 */

instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // config.params = { a: "b" };
    // config.headers.Authorization = "sss";
    let token = getToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么,，必须返回Promise.reject
    return Promise.reject(error);
  },
);

/**
 * 添加响应拦截器
 */
instance.interceptors.response.use(
  (response) => {
    const { data } = response;
    // console.log(">>>>>响应数据", data);
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if (data.code === 1000) {
      return response.data;
    } else {
      ElMessage.error(data.message);
      return Promise.reject(response);
    }
  },
  async (error) => {
    // 超时拦截
    // 非 2xx 范围的状态码都会触发该函数。业务状态码处理
    // 对响应错误做点什么
    let { response } = error;
    if (!response) {
      response = { status: 500, message: "网络异常，请稍后重试！" };
    }
    const { status } = response;
    const userStore = useUserStore();
    switch (status) {
      case 401:
        if (error.config.url != "/admin/base/open/refreshToken") {
          console.log(">>>>>401错误");
          console.log(">>>>error.config>", error.config);
          try {
            const res = await refreshToken(); // TODO 并发会多次发送该请求
            setToken(res.data.token);
            // 请求重新发送,
            const resp = await instance(error.config);
            return resp;
          } catch (error) {
            localStorage.clear();
            location.reload();
            return Promise.reject(error);
          }
        }
        break;
      // ElMessage.error("身份过期，请重新登录");
      // userStore.logout(false);
      // 退出登录需要接口
      case 403:
        ElMessage.error("无权限访问");
        break;
      case 404:
        ElMessage.error("请求地址不存在");
        break;
      case 500:
        ElMessage.error("网络异常，请稍后重试！");
        break;
      case 502:
        ElMessage.error("网关错误");
        break;
      case 503:
        ElMessage.error("服务器错误");
        break;
    }
    return Promise.reject(error);
  },
);

export default instance;
