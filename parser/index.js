/* 本脚本的目标是动态在tsx进行如下操作
 *  1. 插入依赖
 *  2. 调用useTranslation hook
 *  3. 包裹字符串
 *  因为他是hook，所以只能在function component中使用，所以class component需要手动改一改
 */
const fs = require('fs');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const core = require('@babel/core');
const path = require('path');
const srcPath = path.resolve('../../srm-fe', 'src/components/menu');
const prettier = require('prettier');
const prettierConfig = require('../.prettierrc.json');
const outputPath = path.resolve('../', 'output.json');
const { getAllTSXFile } = require('./util');
let arg = process.argv.slice(2);

if (fs.existsSync(outputPath)) {
  fs.unlinkSync(outputPath);
}

const IMPORT_SOURCE = 'react-i18next';
const I8N_FUNC_NAME = 't';
const USE_TRANSLATION_FUN = 'useTranslation';
const RegExistSpace = /[\f\r\t\n\s]/;
const RegTestContent = /[^\f\r\t\n\s]+/g; // 匹配所有非空格内容

const hasChinese = function (value) {
  return /[\u4e00-\u9fa5]+/g.test(value);
};

const output = [];

const runParser = function (code) {
  let ast = babelParser.parse(code, {
    sourceType: 'module', // default: "script"
    plugins: ['typescript', 'jsx'],
  });

  const createIntlCall = function (value) {
    let callee = t.identifier(I8N_FUNC_NAME);
    let newString = t.stringLiteral(value);
    return t.callExpression(callee, [newString]);
  };

  const createImportIntl = function () {
    let importSpecifier = t.importSpecifier(t.identifier(USE_TRANSLATION_FUN), t.identifier(USE_TRANSLATION_FUN));
    return t.importDeclaration([importSpecifier], t.stringLiteral(IMPORT_SOURCE));
  };

  const createUseTranslationExpression = function () {
    let objectProperty = t.objectProperty(t.identifier(I8N_FUNC_NAME), t.identifier(I8N_FUNC_NAME), false, true);
    let objectPattern = t.objectPattern([objectProperty]);
    let callee = t.identifier(USE_TRANSLATION_FUN);
    let useTranslationCall = t.callExpression(callee, []);
    let tDeclarator = t.variableDeclarator(objectPattern, useTranslationCall);
    const node = t.variableDeclaration('const', [tDeclarator]);
    return node;
  };

  const createJSXExpressionContainer = function (value) {
    let newCall = createIntlCall(value);
    // 和文档 不同 文档是 t.jsxExpressionContainer 太坑
    return t.jSXExpressionContainer(newCall);
  };

  const createJSXText = function (value) {
    let newJsx = t.jSXText(value);
    newJsx.isNewCreate = true;
    return newJsx;
  };

  let isFunctionComponent = false;
  //todo 判断是函数组件!! 普通函数要做区分 一定要是函数组件!(判断)  ,然后插入 useTranslation

  // 问题罗列
  // 1.  判断是函数组件!!
  // 2.  中文unicode转回
  // 3.  换行\n 提取出test,再拼接
  traverse(ast, {
    enter: function (path) {
      // 进入节点
      // output.push(path.node);
      // console.log(path.node)
    },
    Program: function (path) {
      const { node } = path;
      const { body } = node; // 遍历节点找到ImportDeclaration
      // console.log('body', body);
      let hasImportIntl = body.some((node) => {
        if (t.isImportDeclaration(node)) {
          const {
            source: { value },
          } = node;
          return value === IMPORT_SOURCE;
        } else {
          return false;
        }
      });
      if (!hasImportIntl) {
        let lastImportIndex = -1;
        for (let i = 0; i < body.length; i++) {
          if (t.isImportDeclaration(body[i])) {
            lastImportIndex = i;
          }
        }
        let newImport = createImportIntl();
        body.splice(lastImportIndex + 1, 0, newImport);
      }
    },
    StringLiteral: function (path) {
      const { node, parent } = path;
      const { value } = node;
      // import 语句中不处理
      if (t.isImportDeclaration(parent)) {
        return;
      }
      // 至少一个中文
      if (!hasChinese(value)) {
        return;
      }
      // new Error('屏蔽标识、资源标识、屏蔽标签不能同时为空') 这种会先new，再调用CallExpression 所以会重复
      if (t.isNewExpression(parent)) {
        return;
      }
      if (t.isCallExpression(parent)) {
        // output[value] = value;
        const { callee } = parent;
        if (t.isIdentifier(callee) && callee.name === I8N_FUNC_NAME) return;
      }
      if (t.isJSXAttribute(parent)) {
        let jsxContainer = createJSXExpressionContainer(value);
        path.replaceWith(jsxContainer);
      } else {
        let newCall = createIntlCall(value);
        path.replaceWith(newCall);
      }
    },
    // 模版字符串
    TemplateLiteral: function (path) {
      const { node } = path;
      // expressions 表达式
      // quasis 表示表达式中的间隙字符串, 每个表达式中间都必须有quasis, 同时首尾也必须是quasis,其中末尾元素需要是tail = true
      // 其中 quasis: {
      //    value: 值, 如果为‘’,一般表示给表达式的占位符
      //     tail: 是否为末尾
      // }
      const { expressions, quasis } = node;
      // todo 获取所有quasis中value 不为空和数字的, 如果不为末尾,记录前面有几个''
      // 生成函数, 插入expressions数组中, 修改quasis节点value为空
      // 如果字符串为最后一个节点,还需要生成一个空白的节点
      let hasTail = false;
      let enCountExpressions = 0;
      quasis.forEach((node, index) => {
        const {
          value: { raw },
          tail,
        } = node;
        if (!hasChinese(raw)) {
          return;
        } else {
          let newCall = createIntlCall(raw);
          expressions.splice(index + enCountExpressions, 0, newCall);
          enCountExpressions++;
          node.value = {
            raw: '',
            cooked: '',
          };
          // 每增添一个表达式都需要变化原始节点,并新增下一个字符节点
          quasis.push(
            t.templateElement(
              {
                raw: '',
                cooked: '',
              },
              false,
            ),
          );
        }
      });
      quasis[quasis.length - 1].tail = true;
    },
    JSXText: function (path) {
      const { node, parent } = path;
      const { value } = node;
      // console.log(value, node.isNewCreate);
      if (node.isNewCreate) {
        return;
      }
      // 至少一个中文
      if (!hasChinese(value)) {
        return;
      }
      // console.log('JSXText', value);
      // todo 每一个字符串都需要包成函数
      // 如果没有换行符直接替换

      if (!RegExistSpace.test(value)) {
        path.replaceWith(createJSXExpressionContainer(value));
      } else {
        const contentResults = [];
        let currentResult;
        do {
          currentResult = RegTestContent.exec(value);
          if (currentResult) {
            contentResults.push(currentResult);
          }
        } while (currentResult !== null);
        // // 根据结果重新生成所有子节点
        let endIndex = -1;
        const newAstNodes = [];
        contentResults.forEach((contentItem, index) => {
          const [contentValue] = contentItem;
          const contentIndex = contentItem.index;
          if (index === 0) {
            if (contentIndex === 0) {
              newAstNodes.push(createJSXExpressionContainer(contentValue));
            } else {
              newAstNodes.push(createJSXText(value.substring(0, contentIndex)));
              newAstNodes.push(hasChinese(contentValue) ? createJSXExpressionContainer(contentValue) : createJSXText(contentValue));
            }
          } else {
            const lastContent = contentResults[index - 1];
            const [lastContentValue] = lastContent;
            const lastContentIndex = lastContent.index;
            const lastEnd = lastContentIndex + lastContentValue.length;
            newAstNodes.push(createJSXText(value.substring(lastEnd, contentIndex)));
            newAstNodes.push(hasChinese(contentValue) ? createJSXExpressionContainer(contentValue) : createJSXText(contentValue));
          }
          endIndex = contentIndex + contentValue.length;
        });
        if (endIndex !== value.length - 1) {
          newAstNodes.push(createJSXText(value.substring(endIndex, value.length - 1)));
        }
        // console.dir(newAstNodes, { depth: null });
        path.replaceWithMultiple(newAstNodes);
      }
    },
    ReturnStatement: function (path) {
      const { node, parent, parentPath } = path;
      // 通过return函数判断父亲是不是一个函数组件
      // 1.return 返回jsx代码
      // 2.调用return的是函数表达式或者箭头函数表达式
      // 3.函数没有被其他函数包裹
      // output.push(path);
      // output.push(parentPath.parent);
      if (
        (t.isJSXElement(node.argument) || t.isConditionalExpression(node.argument) || t.isJSXFragment(node.argument)) && 
        (t.isArrowFunctionExpression(parentPath.parent) || t.isFunctionExpression(parentPath.parent) || t.isFunctionDeclaration(parentPath.parent)) && 
        path.findParent((path) => path.isArrowFunctionExpression() || path.isFunctionExpression()) === null
      ) {
        isFunctionComponent = true;
        // 粗浅
        const { body } = parent;
        let hasUseTranslation = false;
        body.forEach((bodyNode) => {
          if (t.isVariableDeclaration(bodyNode)) {
            const { kind, declarations } = bodyNode;
            if (kind === 'const' && declarations.length === 1 && t.isVariableDeclarator(declarations[0])) {
              const { init } = declarations[0];
              if (t.isCallExpression(init)) {
                const { callee } = init;
                if (callee.name === USE_TRANSLATION_FUN) {
                  hasUseTranslation = true;
                }
              }
            }
          }
        });
        if (!hasUseTranslation) {
          // body.unshift(createUseTranslationExpression());
          body.unshift(babelParser.parse('const { t } = useTranslation()').program.body[0]);
        }
      }
    },
  });
  // console.dir(ast, { depth: null });
  //
  const newAst = generate(ast, {
    jsescOption: { minimal: true },
  });
  // console.dir(newAst);
  return isFunctionComponent ? newAst.code : code;
};

if (arg[0] === 'all') {
  try {
    let fileLists = getAllTSXFile(srcPath, []);
    fileLists.forEach((file) => {
      console.log('file', file);
      const code = fs.readFileSync(path.resolve(file), 'utf8');
      const targetCode = runParser(code);
      const newFilePathArr = file.split('/');
      // const srcIndex = newFilePathArr.indexOf('src');
      // newFilePathArr[srcIndex + 1] = newFilePathArr[srcIndex + 1] + '1'; // 临时拷贝到一个新目录用作对比
      // fs.mkdirSync(newFilePathArr.slice(0, -1).join('/'), { recursive: true });
      // fs.writeFile(newFilePathArr.join('/'), targetCode, null, () => {});
      fs.writeFile(file, targetCode, null, () => {});
    });
  } catch (error) {
    console.log(error);
    console.warn(error);
  }
} else {
  // parse src/test.tsx file and output into test2.tsx
  const code = fs.readFileSync(path.resolve('../../srm-fe', 'src/Packages/Polaris/pages/index.tsx'), 'utf8');
  const targetCode = runParser(code);

  fs.writeFile(path.resolve('../../srm-fe', 'src/Packages/Polaris/pages/index.tsx'), targetCode, null, () => {});
}

// write the mountainous log into the output
// fs.writeFile(outputPath, JSON.stringify(output, null, 2), null, () => {});
