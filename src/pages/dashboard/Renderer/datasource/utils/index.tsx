import _ from 'lodash';

/**
 * prometheus 接口默认不会把 null 点返回
 * 会导致视觉上该时间点有数据存在的假象
 * 目前先前端处理补全断点
 */
export function completeBreakpoints(step, data) {
  const result: any[] = [];
  _.forEach(data, (item, idx) => {
    if (idx > 0) {
      const prev = result[result.length - 1];
      if (prev[0] + step < item[0]) {
        result.push([prev[0] + step, null]);
      }
    }
    result.push(item);
  });
  return result;
}
