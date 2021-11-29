function getApi(path: string) {
  const prefix = '/api/n9e/busi-group';
  return (busiGroup: number) => {
    return `${prefix}/${busiGroup}/${path}`;
  }
}
  
const api = {
  tasktpls: getApi('/task-tpls'),
  tasktpl: getApi('/task-tpl'),
  tasks: getApi('/tasks'),
  task: getApi('/task'),
  perms: getApi('/builtin-perms'),
};

export default api;
  