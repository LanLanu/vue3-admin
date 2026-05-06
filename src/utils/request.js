/**
 * 封装axios
 *
 *  */
import axios from "axios";
import { ElMessage } from "element-plus";
const instance = axios.create({
  // TODO 处理本地生产环境变量
  baseURL: "http://127.0.0.1:8001",
  timeout: 3 * 1000, // 请求超时3秒
});
/**
 * 添加请求拦截器
 */

instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // config.params = { a: "b" };
    config.headers.Authorization = "sss";
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
    console.log(">>>>>响应数据", data);
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if (data.code === 1000) {
      return response.data;
    } else {
      ElMessage.error(data.message);
      return Promise.reject(response);
    }
  },
  (error) => {
    // 非 2xx 范围的状态码都会触发该函数。业务状态码处理
    // 对响应错误做点什么
    return Promise.reject(error);
  },
);

export default instance;
