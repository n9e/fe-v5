/* 本脚本的目标是动态在tsx进行如下操作
 *  1. 插入依赖
 *  2. 调用useTranslation hook
 *  3. 包裹字符串
 *  因为他是hook，所以只能在function component中使用，所以class component需要手动改一改
 */
const { match } = require('assert');
const fs = require('fs');
const path = require('path');
const paths = ['src/locales/zh_HK.json']

const srcPath = path.resolve('../../srm-fe', 'src/locales/zh_HK.json');

const outputPath = path.resolve('../', 'output.json');

if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}


const code = fs.readFileSync(srcPath, 'utf8');
const obj = JSON.parse(code)
const result = {}

const extract = ()=>{
  for(let k of Object.keys(obj)){
    result[k] = ''
  }
}

const extractValue = ()=>{
  for(let k of Object.keys(obj)){
    result[obj[k]] = ''
  }
}
extract(obj)
// extractValue(obj)

fs.writeFile(outputPath, JSON.stringify(result, null, 2), null, () => {});
