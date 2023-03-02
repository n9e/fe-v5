/* 本脚本的目标是动态在tsx进行如下操作
 *  1. 插入依赖
 *  2. 调用useTranslation hook
 *  3. 包裹字符串
 *  因为他是hook，所以只能在function component中使用，所以class component需要手动改一改
 */
const { match } = require('assert');
const fs = require('fs');
const path = require('path');
const srcPath = path.resolve('../../srm-fe', 'src/Packages/Event');
// const srcPath = path.resolve('../', 'src');
const localePath = path.resolve('../../srm-fe/src','locales/en.json')
const outputPath = path.resolve('../', 'output.json');
const { getAllTSXFile } = require('./util');
let arg = process.argv.slice(2);

if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}

const reg = /t\('([\u4e00-\u9fa5：，。、a-z\f\r\t\n\s]+)'\)/g
const regDoubleQuotation = /t\("([\u4e00-\u9fa5：，。、a-z\f\r\t\n\s]+)"\)/g

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
  const matchArr1 = str.match(regDoubleQuotation)
  if(matchArr1 && matchArr1.length > 0 ){
    // "t('新增指标')" => {新增指标:''}
    const a = matchArr1.map(k=>({[k.slice(3, -2)]:''})).reduce((prev,curr)=>{
      return {...curr, ...prev}
    },{})
    obj = {...a,...obj}
  }
  console.log(obj)
}

const filterEmptyKey = (obj, locales)=>{
  const objArr = Object.keys(obj).filter(item => !locales[item])
  const result = objArr.reduce((prev,curr)=> ({...prev,[curr]:''}),{} )
  console.log(objArr, result)
   return result 
  
}
const locales = JSON.parse(fs.readFileSync(localePath, 'utf8'))
if (arg[0] === 'all') {
  try {
    let fileLists = getAllTSXFile(srcPath, []);
    fileLists.forEach((file) => {

      const code = fs.readFileSync(path.resolve(file), 'utf8');
      extractI18nKey(code)
    });
  } catch (error) {
    console.log(error);
    console.warn(error);
  }
} else {
  const code = fs.readFileSync(path.resolve('../../srm-fe', 'src/Packages/MultiDimension/AddTopic/components/DatasourceSelect/index.tsx'), 'utf8');
  extractI18nKey(code)
}

// write the mountainous log into the output
// fs.writeFile(outputPath, JSON.stringify(locales, null, 2), null, () => {});
fs.writeFile(outputPath, JSON.stringify(filterEmptyKey(obj, locales), null, 2), null, () => {});
