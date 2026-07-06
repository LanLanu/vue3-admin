import store2 from "store2";
/**
 * 菜单数据树形结构
 * @param {*} list
 * @returns
 */
export function deepTree(list = []) {
  const result = [];
  let map = {};
  //   添加id对应他的映射{1:{id:1,...}}
  for (const item of list) {
    map[item.id] = { ...item };
  }
  // 添加子集
  for (const item of list) {
    // 是父级
    if (!item.parentId) {
      result.push(map[item.id]);
    } else {
      // 找到父级添加children
      if (map[item.parentId]["children"]) {
        // 直接修改引入的父级堆内存，添加进result的父级堆内存同样改变
        map[item.parentId]["children"].push(map[item.id]);
      } else {
        map[item.parentId]["children"] = [map[item.id]];
      }
    }
  }
  return result;
}
/**
 * 判断是否有子集
 * @param {*} list
 * @param {*} id
 * @returns {Boolean}
 *  true 表示无子集
 *  false 表示有子集
 */
export function isLeaf(list, id) {
  return list.every((item) => item.parentId !== id);
}

export function setRefreshToken(payload) {
  store2.set("refreshToken", payload);
}
export function getRefreshToken() {
  return store2.get("refreshToken");
}
export function setToken(payload) {
  store2.set("token", payload);
}
export function getToken() {
  return store2.get("token");
}
