export function filter(tree, query) {
  console.log(tree, query);
  let defaultExpandedKeys = [];
  console.log();
  let queryTree = tree.filter((ele) => {
    ele.children = ele.children.filter((child) => {
      return dfs(child, query);
    });
    return dfs(ele, query);
  });
  function dfs(node, query) {
    //判读该节点和该节点的子元素key是否包含query
    if (node) {
      let temp = node.children.filter((e) => {
        e.children = e.children.filter((child) => {
          //过滤最后一层
          return dfs(child, query);
        });
        return dfs(e, query);
      });
      if (temp.length > 0) {
        //该节点的子元素key包含query,该元素展开
        defaultExpandedKeys.push(node.key);
      }
      return node.title.includes(query) || (temp.length > 0 ? true : false);
    }
  }
  defaultExpandedKeys = Array.from(new Set(defaultExpandedKeys));
  return { queryTree, defaultExpandedKeys };
}
