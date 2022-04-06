/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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