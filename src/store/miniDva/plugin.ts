/* eslint-disable */
type hooksType = {
  onEffect?: any;
  extraReducers?: any;
};
type hooksArray = ['onEffect', 'extraReducers'];
export default class Plugin {
  hooks: hooksType;
  constructor(hooksArray: hooksArray) {
    // 初始化把钩子都做成数组
    this.hooks = hooksArray.reduce((prev, next) => {
      prev[next] = [];
      return prev;
    }, {}); // { hook:[], hook:[] }
  }
  use(plugin) {
    //因为会多次use，所以就把函数或者对象push进对应的钩子里
    const { hooks } = this;
    for (let key in plugin) {
      hooks[key].push(plugin[key]);
    }
  }
  get(key) {
    // 不同的钩子进行不同处理
    if (key === 'extraReducers') {
      // 处理reducer，就把所有对象并成总对象，这里只能是对象形式才能满足后面并入combine的操作。
      return Object.assign({}, ...this.hooks[key]);
    } else {
      return this.hooks[key]; // 其他钩子就返回用户配置的函数或对象
    }
  }
}
