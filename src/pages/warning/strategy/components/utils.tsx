import _ from 'lodash';

export const parseTimeToValueAndUnit = (value?: number) => {
  if (!value) {
    return {
      value: value,
      unit: 'min',
    };
  }
  let time = value / 60;
  if (time < 60) {
    return {
      value: time,
      unit: 'min',
    };
  }
  time = time / 60;
  return {
    value: time,
    unit: 'hour',
  };
};

export const normalizeTime = (value?: number, unit?: 'min' | 'hour') => {
  if (!value) {
    return value;
  }
  if (unit === 'min') {
    return value * 60;
  }
  return value * 60 * 60;
};

/**
 * es 的 query 和 rules 设置为了兼容开源接口，需要转换成 json string 放到 prom_ql 字段里
 * 这里需要把 prom_ql 转换成结构化的 query
 * 这里面还需要转换一些时间字段，这些时间字段默认是秒单位，需要转换成分钟或是小时，xxx_unit: 'min' | 'hour'
 *  1. interval 拆开成 interval 和 interval_unit
 *  2. rule.compare_time 拆开成 compare_time 和 compare_time_unit
 */
export const parseValues = (values: any = {}) => {
  const cloned = _.cloneDeep(values);
  const cate = cloned.cate || 'prometheus';
  if (cate === 'elasticsearch') {
    const queryString = cloned.prom_ql;
    let query: any = {};
    try {
      query = JSON.parse(queryString);
    } catch (e) {
      console.error(e);
    }
    query.interval = parseTimeToValueAndUnit(query.interval).value;
    query.interval_unit = parseTimeToValueAndUnit(query.interval).unit;
    query.rules = _.map(query.rules, (rule: any) => {
      return {
        ...rule,
        rule: _.map(rule.rule, (item: any) => {
          return {
            ...item,
            compare_time: parseTimeToValueAndUnit(item.compare_time).value,
            compare_time_unit: parseTimeToValueAndUnit(item.compare_time).unit,
          };
        }),
      };
    });
    cloned.query = query;
  }
  cloned.cate = cate;
  return cloned;
};

/**
 * 同上，提交前需要把结构化的 query 转换成 prom_ql
 * 以及上面被转换的时间字段，也需要转换回秒
 */
export const stringifyValues = (values) => {
  const cloned = _.cloneDeep(values);
  const cate = cloned.cate || 'prometheus';
  if (cate === 'elasticsearch') {
    const query = cloned.query;
    query.interval = normalizeTime(query.interval, query.interval_unit);
    delete query.interval_unit;
    query.rules = _.map(query.rules, (rule: any) => {
      return {
        ...rule,
        rule: _.map(rule.rule, (item: any) => {
          const compare_time = normalizeTime(item.compare_time, item.compare_time_unit);
          delete item.compare_time_unit;
          return {
            ...item,
            compare_time,
          };
        }),
      };
    });
    cloned.prom_ql = JSON.stringify(query);
    delete cloned.query;
  }
  return cloned;
};
