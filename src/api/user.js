import request from "../utils/request.js";
import store2 from "store2";
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

