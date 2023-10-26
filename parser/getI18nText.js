/* 
  本脚本用于提取项目中的中文文案，生成一个json文件，用于翻译
 */
const fs = require('fs');
const path = require('path');
const srcPath = path.resolve('/Users/flashcat/JavaScript/srm-fe/src/Packages');
// const srcPath = path.resolve('../', 'src');
const localePath = path.resolve('/Users/flashcat/Desktop/v5_en_US.json');
const outputPath = path.resolve('../', 'output.json');
const { getAllTSXFile } = require('./util');
let arg = process.argv.slice(2);

if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}

const reg = /t\('([\u4e00-\u9fa5：，。、a-zA-Z\f\r\t\n\s]+)'\)/g;
const regDoubleQuotation = /t\("([\u4e00-\u9fa5：，。、a-zA-Z\f\r\t\n\s]+)"\)/g;

let obj = {};

const extractI18nKey = (str) => {
  const matchArr = str.match(reg);
  console.log(matchArr);
  if (matchArr && matchArr.length > 0) {
    // "t('新增指标')" => {新增指标:''}
    const a = matchArr
      .map((k) => ({ [k.slice(3, -2)]: '' }))
      .reduce((prev, curr) => {
        return { ...curr, ...prev };
      }, {});
    obj = { ...a, ...obj };
  }
  const matchArr1 = str.match(regDoubleQuotation);
  if (matchArr1 && matchArr1.length > 0) {
    // "t('新增指标')" => {新增指标:''}
    const a = matchArr1
      .map((k) => ({ [k.slice(3, -2)]: '' }))
      .reduce((prev, curr) => {
        return { ...curr, ...prev };
      }, {});
    obj = { ...a, ...obj };
  }
};

const filterEmptyKey = (obj, locales) => {
  const objArr = Object.keys(obj).filter((item) => !locales[item]);
  const result = objArr.reduce((prev, curr) => ({ ...prev, [curr]: '' }), {});
  return result;
};
const locales = JSON.parse(fs.readFileSync(localePath, 'utf8'));
if (arg[0] === 'all') {
  try {
    let fileLists = getAllTSXFile(srcPath, []);
    fileLists.forEach((file) => {
      const code = fs.readFileSync(path.resolve(file), 'utf8');
      extractI18nKey(code);
    });
  } catch (error) {
    console.log(error);
    console.warn(error);
  }
} else {
  const code = fs.readFileSync(path.resolve('../', 'src/pages/dashboard/List/Import.tsx'), 'utf8');
  extractI18nKey(code);
}

// write the mountainous log into the output
// fs.writeFile(outputPath, JSON.stringify(locales, null, 2), null, () => {});
fs.writeFile(outputPath, JSON.stringify(filterEmptyKey(obj, locales), null, 2), null, () => {});
