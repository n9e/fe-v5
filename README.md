## 夜莺 v5

#### installation

```
npm install
```

#### start

```
npm run dev
```

#### 开发须知

- 页面在 `src/pages`
- 组件在 `src/components`
- 路由配置 `src/routes`
- 菜单配置 `src/components/menu/index.tsx`
- request 配置 `src/services` 为了避免跟页面中的方法冲突，services 暴露出的方法大写开头
- alias 配置 需要在 vite.config.js 和 tsconfig.json 一起配置
- 如果 css 中嵌套语法有 warning，需要打开 vscode 的 setting.json 增加 `"css.validate": false`

#### TODO

- [ ] antd css 重复加载！
- [ ] 全局处理 request 的 error
- [x] login 页面美化
- [x] 登录页 redirect 逻辑补齐
- [x] umi-request 有没有类似 baseUrl 的入参，不想每个接口都写一个前缀
- [ ] 好多页面都有搜索框和 button，各自写的样式，可以抽离成同意的样式
- [ ] src/components/menu/index.tsx line: 36 行 写两个 key as string 感觉有点傻
- [ ] 全局搜索// @ts-ignore 需要 fix
- [ ] /metric/explorer 样式优化，左边不垂直滚动，右边超出滚动
- [ ] /metric/explorer refresh 按钮点击后会导致图标多渲染一次
- [ ] /metric/explorer 右侧 header 增加 Affix 固钉
- [ ] /metric/chart.tsx 中 initChart 如果不写类型，为什么默认是 never[]
- [ ] 所有的删除操作，加个二次确认的 popover 框
- [ ] info.tsx 中的 warning
- [ ] component 中为啥两个 menu.less
