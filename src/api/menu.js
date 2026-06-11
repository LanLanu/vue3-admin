import request from "@/utils/request";
/**
 * 获取菜单列表数据
 * @returns
 */
export function getMenuList() {
  return request.post("/admin/base/sys/menu/list");
}