/*
  prompt：把选中json中的key，翻译成英语并填入value中 
  ctrl+k 然后输入上述prompt
 */
const fs = require('fs');
const path = require('path');

const getAllTSXFile = function (dir, filesLists = []) {
  const files = fs.readdirSync(dir);
  files.forEach((item, index) => {
    var fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllTSXFile(path.join(dir, item), filesLists); //递归读取文件
    } else if (/^(\w+)*\.tsx$/g.test(item) || /^(\w+)*\.ts$/g.test(item)) {
      filesLists.push(fullPath);
    }
  });
  return filesLists;
};

module.exports = {
  getAllTSXFile,
};
