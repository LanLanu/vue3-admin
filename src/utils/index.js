/**
 * 菜单数据树形结构
 * @param {*} list
 * @returns
 */
export function deepTree(list) {
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
console.log(">>>>>", deepTree(list));
