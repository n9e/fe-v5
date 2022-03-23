import _ from 'lodash';
import valueFormatter from './valueFormatter';
import { IValueMapping } from '../../types';

const getValueAndToNumber = (value: any[]) => {
  return _.toNumber(_.get(value, 1, NaN));
};

export const getSerieTextObj = (value: number, standardOptions?: any, valueMappings?: IValueMapping[]) => {
  const { util, decimals } = standardOptions || {};
  const matchedValueMapping = _.find(valueMappings, (item) => {
    const { type, match } = item;
    if (type === 'special') {
      return value === match?.special;
    } else if (type === 'range') {
      if (match?.from && match?.to) {
        return value >= match?.from && value <= match?.to;
      } else if (match?.from) {
        return value >= match?.from;
      } else if (match?.to) {
        return value <= match?.to;
      }
      return true;
    }
  });
  return {
    text: matchedValueMapping?.result?.text ? matchedValueMapping?.result?.text : valueFormatter({ util, decimals }, value),
    color: matchedValueMapping?.result?.color,
  };
}

const getCalculatedValuesBySeries = (series: any[], calc: string, { util, decimals }, valueMappings?: IValueMapping[], aggrDimension?: string) => {
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
      id: serie.id,
      name: serie.name,
      metric: serie.metric,
      stat,
      ...getSerieTextObj(stat, { util, decimals }, valueMappings),
    };
  });
  if (aggrDimension) {
    const grouped = _.groupBy(values, (item) => {
      return item.metric[aggrDimension];
    });
    const newValues = _.map(grouped, (val, key) => {
      const item: any = {
        name: key,
      };
      const subGrouped = _.groupBy(val, (item) => {
        return item.name;
      });
      _.forEach(subGrouped, (subVal, subKey) => {
        item[subKey] = {
          id: subVal[0].id,
          stat: subVal[0].stat,
          color: subVal[0].color,
          text: subVal[0].text,
        };
      });
      item.groupNames = _.keys(subGrouped);
      return item;
    });
    return newValues;
  }
  return values;
};

export default getCalculatedValuesBySeries;