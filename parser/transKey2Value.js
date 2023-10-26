/* 
本脚本的目的是把下列object中key翻译了，并填在value上
{
    "Flashcat下钻分析过程中联动Tracing系统来定位问题": "",
    "Tracing查询展示": ""
}
 */
const { traditionalized } = require('./traditionalized');
const fs = require('fs');
const path = require('path');
const srcPath = path.resolve('../zh_HK.json');

const locales = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
let result = {};

for (let key of Object.keys(locales)) {
  result[key] = traditionalized(key);
}

fs.writeFile(srcPath, JSON.stringify(result, null, 2), null, () => {});
