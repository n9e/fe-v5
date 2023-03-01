/* 本脚本的目标是动态在tsx进行如下操作
 *  1. 插入依赖
 *  2. 调用useTranslation hook
 *  3. 包裹字符串
 *  因为他是hook，所以只能在function component中使用，所以class component需要手动改一改
 */
const { match } = require('assert');
const fs = require('fs');
const path = require('path');
const srcPath = path.resolve('../../srm-fe', 'src');
// const srcPath = path.resolve('../', 'src');
const outputPath = path.resolve('../', 'output.json');
const { getAllTSXFile } = require('./util');
let arg = process.argv.slice(2);

if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}

const reg = /t\('([\u4e00-\u9fa5]+)'\)/g

let obj = {}

const extractI18nKey = (str)=>{
  const matchArr = str.match(reg)
  if(matchArr && matchArr.length > 0 ){
    // "t('新增指标')" => {新增指标:''}
    const a = matchArr.map(k=>({[k.slice(3, -2)]:''})).reduce((prev,curr)=>{
      return {...curr, ...prev}
    },{})
    obj = {...a,...obj}
  }
  console.log(obj)
}

if (arg[0] === 'all') {
  try {
    let fileLists = getAllTSXFile(srcPath, []);
    fileLists.forEach((file) => {
      console.log('file', file);
      const code = fs.readFileSync(path.resolve(file), 'utf8');
      extractI18nKey(code)
    });
  } catch (error) {
    console.log(error);
    console.warn(error);
  }
} else {
  const code = fs.readFileSync(path.resolve('../../srm-fe', 'src/Packages/Polaris/pages/Detail/index.tsx'), 'utf8');
  extractI18nKey(code)
}

// write the mountainous log into the output
fs.writeFile(outputPath, JSON.stringify(obj, null, 2), null, () => {});
