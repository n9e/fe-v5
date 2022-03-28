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

const getCalculatedValuesBySeries = (series: any[], calc: string, { util, decimals }, valueMappings?: IValueMapping[]) => {
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
      fields: {
        ...serie.metric,
        refId: serie.refId,
      },
      stat,
      ...getSerieTextObj(stat, { util, decimals }, valueMappings),
    };
  });
  return values;
};

export const getLegendValues = (series: any[], { util, decimals }) => {
  const values = _.map(series, (serie) => {
    const results = {
      max: getValueAndToNumber(_.maxBy(serie.data, (item) => _.toNumber(item[1]))),
      min: getValueAndToNumber(_.minBy(serie.data, (item) => _.toNumber(item[1]))),
      avg: _.meanBy(serie.data, (item) => _.toNumber(item[1])),
      sum: _.sumBy(serie.data, (item) => _.toNumber(item[1])),
      last: getValueAndToNumber(_.last(serie.data)),
    };
    return {
      id: serie.id,
      name: serie.name,
      max: valueFormatter({ util, decimals }, results.max),
      min: valueFormatter({ util, decimals }, results.min),
      avg: valueFormatter({ util, decimals }, results.avg),
      sum: valueFormatter({ util, decimals }, results.sum),
      last: valueFormatter({ util, decimals }, results.last),
    };
  });
  return values;
}

export default getCalculatedValuesBySeries;