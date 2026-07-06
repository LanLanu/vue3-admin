import { getRefreshToken } from "@/utils/index.js";
import request from "../utils/request.js";
import store2 from "store2";
import { ElMessage } from "element-plus";
export const getCaptcha = async () => {
  return request.get("/admin/base/open/captcha");
};
export const login = async (data) => {
  return request.post("/admin/base/open/login", data);
};
export const getUserInfo = async () => {
  return request.get("/admin/base/comm/person");
};
export const logout = async () => {
  return request.post("/admin/base/comm/logout");
};
/**
 * 获取全部
 * @returns
 */
export const getUserList = async () => {
  return request.post("/admin/base/sys/user/list");
};
/**
 * 分页获取
 * @returns
 */
export function getUserPage(data) {
  return request.post("/admin/base/sys/user/page", data);
}
/**
 * 新增
 * @returns
 */
export function addUser(data) {
  return request.post("/admin/base/sys/user/add", data);
}
/**
 * 删除
 * @returns
 */
export function deleteUser(data) {
  return request.post("/admin/base/sys/user/delete", data);
}
/**
 * 更新
 * @returns
 */
export function updateUser(data) {
  return request.post("/admin/base/sys/user/update", data);
}
/**
 * 刷新token
 */
// export function refreshToken() {
//   return request.get("/admin/base/open/refreshToken", {
//     params: { refreshToken: getRefreshToken() },
//   });
// }
// 刷新token-promise版:解决反复请求问题
let promise = null;
export function refreshToken() {
  if (promise) {
    return promise;
  }
  promise = new Promise((resolve, reject) => {
    request({
      url: "/admin/base/open/refreshToken",
      method: "get",
      params: {
        refreshToken: getRefreshToken(),
      },
    })
      .then((resp) => {
        resolve(resp);
        promise = null;
      })
      .catch((error) => {
        ElMessage.error("刷新token过期，请重新登录！");
        reject(error);
      });
  });
  return promise;
}
