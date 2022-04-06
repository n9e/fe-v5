import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { Range, formatPickerDate } from '@/components/DateRangePicker';

export const getLabelValues = function (label: string, range: Range) {
  return request(`/api/n9e/prometheus/api/v1/label/${label}/values`, {
    method: RequestMethod.Get,
    params: formatPickerDate(range),
  }).then((res) => {
    return res?.data;
  });
};

export const getLabels = function (match: string, range: Range) {
  const params = {
    ...formatPickerDate(range),
  };
  if (match) {
    params['match[]'] = match;
  }
  return request(`/api/n9e/prometheus/api/v1/labels`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => {
    return res?.data;
  });
};

export const getMetricValues = function (match: string, range: Range) {
  return request('/api/n9e/prometheus/api/v1/label/__name__/values', {
    method: RequestMethod.Get,
    params: {
      ...formatPickerDate(range),
      'match[]': match
    }
  }).then((res) => {
    return res?.data;
  });
};

function getQuery(params: {
  isAggr: boolean,
  aggrFunc: string,
  calcArr: string[],
  metric: string,
  match: string,
  offset: string,
  aggrGroups: string[],
}) {
  const { isAggr, aggrFunc, calcArr, metric, match, offset, aggrGroups } = params;
  return `${isAggr ? aggrFunc+'(' : ''}${calcArr[0] ? calcArr[0]+'(' : ''}${metric}${match}${calcArr[1] ? `[${calcArr[1]}]` : ''}${offset ? ` offset ${offset}` : ''}${calcArr[0] ? ')' : ''}${isAggr ? `) by (${_.join(aggrGroups, ', ')})` : ''}`;
}

const getSerieName = (metric: Object) => {
  let name = metric['__name__'] || '';
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  return _.trim(name);
};

export const getExprs = (params) => {
  const { metric, match, calcFunc, comparison, aggrFunc, aggrGroups } = params;
  const calcArr = _.split(calcFunc, '_');
  const isAggr = aggrGroups.length > 0;
  const exprs = [
    getQuery({
      isAggr,
      aggrFunc,
      calcArr,
      metric,
      match,
      offset: '',
      aggrGroups,
    }),
    ..._.map(comparison, (item) => {
      return getQuery({
        isAggr,
        aggrFunc,
        calcArr,
        metric,
        match,
        offset: item,
        aggrGroups,
      });
    })
  ];
  return exprs;
}

export const getQueryRange = function (params: {
  metric: string;
  match: string;
  range: Range;
  step?: number;
  calcFunc: string;
  comparison: string[];
  aggrFunc: string;
  aggrGroups: string[];
}) {
  const { metric, match, range, step, calcFunc, comparison, aggrFunc, aggrGroups } = params;
  let { start, end } = formatPickerDate(range);
  let _step = step;
  if (!step) _step = Math.max(Math.floor((end - start) / 250), 1);
  const calcArr = _.split(calcFunc, '_');
  const isAggr = aggrGroups.length > 0;
  const exprs = getExprs({
    metric,
    match,
    calcFunc,
    comparison, aggrFunc, aggrGroups,
  });
  const requests = _.map(exprs, (expr) => {
    return request('/api/n9e/prometheus/api/v1/query_range', {
      method: RequestMethod.Get,
      params: {
        start,
        end,
        step: _step,
        query: expr,
      }
    });
  });
  return Promise.all(requests).then((res: any) => {
    const series: any[] = [];
    _.forEach(['current', ...comparison], (item, idx) => {
      const dat = res[idx]?.data ? res[idx]?.data : res[idx]; // 处理环比的情况返回结构不一致
      const data = dat.result || [];
      _.forEach(data, (subItem) => {
        series.push({
          name: `${getSerieName(subItem.metric)}${item !== 'current' ? ` offset ${item}` : ''}`,
          id: _.uniqueId('series_'),
          data: subItem.values,
        });
      });
    });
    return series;
  });
};

export const getList = function (range: Range) {
  return request('/api/n9e/metric-views', {
    method: RequestMethod.Get,
    params: formatPickerDate(range),
  }).then((res) => {
    return res?.dat;
  });
};

export const addMetricView = function (data) {
  return request('/api/n9e/metric-views', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res?.dat;
  });
};

export const updateMetricView = function (data) {
  return request('/api/n9e/metric-views', {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    return res?.dat;
  });
};

export const deleteMetricView = function (data) {
  return request('/api/n9e/metric-views', {
    method: RequestMethod.Delete,
    data,
  }).then((res) => {
    return res?.dat;
  });
};

export const setTmpChartData = function (data: { configs: string }[]) {
  return request(`/api/n9e/share-charts`, {
    method: RequestMethod.Post,
    data,
  });
};