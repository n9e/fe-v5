/**
 *
 * @param {*} tree //以构建的完整树形结构：数组对象
 * @param {*} query
 * @returns
 */
export function filter(tree, query) {
  let defaultExpandedKeys = [];
  let queryTree = tree.filter((ele) => {
    //开启dfs
    return isIncludesQuery(ele, query);
  });

  function isIncludesQuery(node, query) {
    //判读该节点是否包含query（深度优先搜索）
    // if (node) {
    //   if (node.title.includes(query)) {
    //     return true;
    //   } else {
    //     node.children =
    //       node.children &&
    //       node.children.filter((e) => {
    //         //子节点层进行过滤
    //         return isIncludesQuery(e, query);
    //       });
    //     if (node.children.length > 0) {
    //       //记录路径（该节点的子节点存在query）
    //       defaultExpandedKeys.push(node.key);
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   }
    // }
    if (node) {
      let tempArr =
        node.children &&
        node.children.filter((e) => {
          //子节点层进行过滤
          return isIncludesQuery(e, query);
        });
      if (tempArr.length > 0) {
        node.children =
          node.children &&
          node.children.filter((e) => {
            //子节点层进行过滤
            return isIncludesQuery(e, query);
          });
        if (node.children.length > 0) {
          //记录路径（该节点的子节点存在query）
          defaultExpandedKeys.push(node.key);
          return true;
        } else {
          return false;
        }
      } else {
        return node.title.includes(query);
      }
    }
  }
  defaultExpandedKeys = Array.from(new Set(defaultExpandedKeys));
  return { queryTree, defaultExpandedKeys };
}
