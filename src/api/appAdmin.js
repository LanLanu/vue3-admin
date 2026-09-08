import request from "@/utils/request";
/**
 * 获取菜单列表数据
 * @returns
 */
export function getAppList() {
  return request.post("/admin/base/appList/list");
}
export function getAppListPage(data) {
  return request.post("/admin/base/appList/page", data);
}
export function addAppList(data) {
  return request.post("/admin/base/appList/add", data);
}
export function updateAppList(data) {
  return request.post("/admin/base/appList/update", data);
}
export function deleteAppList(data) {
  return request.post("/admin/base/appList/delete", data);
}
