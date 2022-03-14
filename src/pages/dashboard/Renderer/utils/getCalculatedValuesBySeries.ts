import _ from 'lodash';
import valueFormatter from './valueFormatter';

const getValueAndToNumber = (value: any[]) => {
  return _.toNumber(_.get(value, 1, NaN));
};

const getCalculatedValuesBySeries = (series: any[], calc: string, { util, decimals }, aggrOperator?: string, aggrDimension?: string) => {
  const values = _.map(series, (serie) => {
    const results = {
      lastNotNull: () => getValueAndToNumber(_.last(_.filter(serie.data, (item) => item[1] !== null))),
      last: () => getValueAndToNumber(_.last(serie.data)),
      firstNotNull: () => getValueAndToNumber(_.first(_.filter(serie.data, (item) => item[1] !== null))),
      first: () => getValueAndToNumber(_.first(serie.data)),
      min: () => getValueAndToNumber(_.minBy(serie.data, (item) => _.toNumber(item[1]))),
      max: () => getValueAndToNumber(_.maxBy(serie.data, (item) => _.toNumber(item[1]))),
      avg: () => _.meanBy(serie.data, (item) => _.toNumber(item[1])),
      sum: () => _.sumBy(serie.data, (item) => _.toNumber(item[1])),
      count: () => _.size(serie.data),
    };
    const stat = results[calc] ? results[calc]() : NaN;
    return {
      name: serie.name,
      metric: serie.metric,
      stat: valueFormatter({ util, decimals }, stat),
    };
  });
  if (aggrDimension) {
    const grouped = _.groupBy(values, (item) => {
      return item.metric[aggrDimension];
    });
    return _.map(grouped, (val, key) => {
      const item: any = {
        name: key,
      };
      const subGrouped = _.groupBy(val, (item) => {
        return item.metric.__name__;
      });
      _.forEach(subGrouped, (subVal, subKey) => {
        const aggrResult = {
          sum: () => _.sumBy(subVal, 'stat'),
          avg: () => _.meanBy(subVal, 'stat'),
          min: () => _.get(_.minBy(subVal, 'stat'), 'stat'),
          max: () => _.get(_.maxBy(subVal, 'stat'), 'stat'),
        }
        if (aggrOperator) {
          item[subKey] = aggrResult[aggrOperator]();
        }
      });
      item.groupNames = _.keys(subGrouped);
      return item;
    });
  }
  return values;
};

export default getCalculatedValuesBySeries;