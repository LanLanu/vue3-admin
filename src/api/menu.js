import request from "@/utils/request";
/**
 * 获取菜单列表数据
 * @returns
 */
export function getMenuList() {
  return request.post("/admin/base/sys/menu/list");
}
export function getMenuPage(data) {
  return request.post("/admin/base/sys/menu/page", data);
}
export function addMenu(data) {
  return request.post("/admin/base/sys/menu/add", data);
}
export function updateMenu(data) {
  return request.post("/admin/base/sys/menu/update", data);
}
export function deleteMenu(data) {
  return request.post("/admin/base/sys/menu/delete", data);
}
