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
/* eslint-disable no-plusplus */
import _ from 'lodash';

export function filterMetrics(filterType, filterValue, alls) {
  if (!(filterType && filterValue)) {
    return [];
  }

  const filters = _.split(filterValue, ',');
  switch (filterType) {
    case 'prefix':
      return _.filter(alls, (m) => {
        for (let i = 0; i < filters.length; i++) {
          if (m && m.indexOf(filters[i]) === 0) {
            return true;
          }
        }
        return false;
      });
    case 'substring':
      return _.filter(alls, (m) => {
        for (let i = 0; i < filters.length; i++) {
          if (m && m.indexOf(filters[i]) !== -1) {
            return true;
          }
        }
        return false;
      });
    case 'suffix':
      return _.filter(alls, (m) => {
        for (let i = 0; i < filters.length; i++) {
          if (m && m.indexOf(filters[i], m.length - filters[i].length) !== -1) {
            return true;
          }
        }
        return false;
      });
    default:
      return [];
  }
}

export function matchMetrics(matches, alls) {
  if (!matches || matches.length === 0) {
    return [];
  }
  if (!alls || alls.length === 0) {
    return [];
  }

  return _.filter(matches, (o) => _.indexOf(alls, o) > -1);
}

export function getClusterNs(allNsData, query) {
  const { ns, category } = query;
  if (category === 'service') {
    return _.filter(allNsData, (item) => {
      const nsSplit = item.split('.');
      nsSplit.splice(0, 2);
      return nsSplit.join('.') === ns;
    });
  }
  return [`collect.${ns}`];
}

export function normalizeGraphData(data) {
  const cloneData = _.cloneDeep(data);
  _.each(cloneData.metrics, (item) => {
    delete item.key;
    delete item.metrics;
    delete item.tagkv;
    delete item.counterList;
    delete item.endpoints;
  });
  return cloneData;
}
