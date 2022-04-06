/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
        if (node.title.includes(query)) {
          defaultExpandedKeys.push(node.key);
          return true;
        } else {
          return false;
        }
      }
    }
  }
  defaultExpandedKeys = Array.from(new Set(defaultExpandedKeys));
  return { queryTree, defaultExpandedKeys };
}
