
export interface Tpl {
  id: number,
  title: string,
  batch: number, // 并发度，页面填充的默认值是0,
  tolerance: number, // 容忍度，页面填充的默认值是0,
  timeout: number, // 单机超时时间，页面填充的默认值是30,
  pause: number, // 暂停点，默认值为空,
  script: string, // 脚本内容，默认值参看之前四维的版本,
  args: string, // 脚本参数，默认值为空,
  tags: string, // 任务模板的标签,
  account: string, // 运行账号,
  hosts: string[],
  create_by: string,
  create_at: number,
  update_by: string,
  update_at: number,
  // grp: Group,
}
