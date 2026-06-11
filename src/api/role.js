import request from "@/utils/request";
/**
 * 获取全部
 * @returns
 */
export function getRoleList() {
  return request.post("/admin/base/sys/role/list");
}
/**
 * 分页获取
 * @returns
 */
export function getRolePage(data) {
  return request.post("/admin/base/sys/role/page", data);
}
/**
 * 新增
 * @returns
 */
export function addRole(data) {
  return request.post("/admin/base/sys/role/add", data);
}
/**
 * 删除
 * @returns
 */
export function deleteRole(data) {
  return request.post("/admin/base/sys/role/delete", data);
}
/**
 * 更新
 * @returns
 */
export function updateRole(data) {
  return request.post("/admin/base/sys/role/update", data);
}
