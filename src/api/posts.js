import request from "@/utils/request";
/**
 * 获取菜单列表数据
 * @returns
 */
export function getPostsList() {
  return request.post("/admin/base/posts/list");
}
export function getPostsPage(data) {
  return request.post("/admin/base/posts/page", data);
}
export function addPosts(data) {
  return request.post("/admin/base/posts/add", data);
}
export function updatePosts(data) {
  return request.post("/admin/base/posts/update", data);
}
export function deletePosts(data) {
  return request.post("/admin/base/posts/delete", data);
}
