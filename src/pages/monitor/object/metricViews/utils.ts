import _ from 'lodash';
import { IMatch } from '../types';

export function getFiltersStr(filters: IMatch['filters']) {
  return _.join(_.map(filters, (item) => `${item.label}${item.oper}"${item.value}"`), ',');
}

export function getMatchStr(match: IMatch) {
  const filtersStr = _.map(match.filters, (item) => `${item.label}${item.oper}"${item.value}"`);
  const dynamicLabelsStr = _.map(match.dynamicLabels, (item) => {
    if (item.value) {
      return `${item.label}=~"${item.value}"`;
    }
    return '';
  });
  const dimensionLabelStr = match.dimensionLabel.label && !_.isEmpty(match.dimensionLabel.value) ? [`${match.dimensionLabel.label}=~"${_.join(match.dimensionLabel.value, '|')}"`] : '';
  const matchArr = _.join(_.compact(_.concat(filtersStr, dynamicLabelsStr, dimensionLabelStr)), ',');
  return matchArr ? `{${matchArr}}` : '';
}