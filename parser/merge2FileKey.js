const fs = require('fs');
const path = require('path');
const srcPath = path.resolve('../en_US.json');
const targetPath = path.resolve('../en_US_1.json');

const src = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const target = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
let result = {};
const srcArr = Object.keys(src);
const targetArr = Object.keys(target);

for (let i = 0; i < srcArr.length; i++) {
  result[targetArr[i]] = srcArr[i];
}

fs.writeFile(srcPath, JSON.stringify(result, null, 2), null, () => {});
