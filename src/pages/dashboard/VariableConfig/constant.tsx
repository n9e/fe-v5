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
import { resourceGroupItem } from '@/store/businessInterface';
import { favoriteFrom } from '@/store/common';
import React, { createContext } from 'react';
import { getLabelNames, getMetricSeries, getLabelValues, getMetric, getQueryResult } from '@/services/dashboard';
import { Range, formatPickerDate } from '@/components/DateRangePicker';
import { FormType } from './EditItem';
import { getVaraiableSelected } from './index';
export const CLASS_PATH_VALUE = 'classpath';
export const CLASS_PATH_PREFIX_VALUE = 'classpath_prefix';
export const DEFAULT_VALUE = '*';
export const DEFAULT_NAME = 'var';

export const TagFilterStore = createContext<any>({});
export const INIT_DATA = 'init_data';
export const ADD_ITEM = 'add_item';
export const UPDATE_ITEM = 'update_item';
export const DELETE_ITEM = 'delete_item';
export const DEFAULT_CLASSPATH_DATA: resourceGroupItem = {
  path: '*',
  id: -1,
  isFavorite: false,
  create_at: 0,
  create_by: 0,
  update_at: 0,
  update_by: 0,
  isBelongIn: favoriteFrom.Common,
  note: '',
  preset: 0,
};

const filterErrorList = (list: Array<any>) => {
  let duplicateList: number[] = [];
  let nonNameList: number[] = [];
  let invalidList: number[] = [];
  let requireList: number[] = [];
  let duplicateKeyList: number[] = [];
  let hasClassPath = false;
  const newMap = new Map<string, number[]>();
  const keyMap = new Map<string, number[]>();
  list.forEach((filterItem, index) => {
    const { tagName, key, value } = filterItem;
    const mapData = newMap.get(tagName);
    if (typeof mapData === 'undefined') {
      newMap.set(tagName, [index]);
    } else {
      newMap.set(tagName, [...mapData, index]);
    }
    const mapData1 = keyMap.get(key);
    if (typeof mapData1 === 'undefined') {
      keyMap.set(key, [index]);
    } else {
      keyMap.set(key, [...mapData1, index]);
    }

    if (tagName === '') {
      nonNameList.push(index);
    }
    if (key === CLASS_PATH_VALUE || key === CLASS_PATH_PREFIX_VALUE) {
      hasClassPath = true;
    }
    if (!/^\w+$/g.test(tagName)) {
      invalidList.push(index);
    }
    if (key === '' || value === '') {
      requireList.push(index);
    }
  });
  for (let i of newMap.values()) {
    if (Array.isArray(i) && i.length > 1) {
      duplicateList = duplicateList.concat(i);
    }
  }
  for (let i of keyMap.values()) {
    if (Array.isArray(i) && i.length > 1) {
      duplicateKeyList = duplicateKeyList.concat(i);
    }
  }
  return {
    duplicateList,
    duplicateKeyList,
    nonNameList,
    invalidList,
    hasClassPath,
    requireList,
  };
};

export const TagFilterReducer = function (state, action) {
  switch (action.type) {
    case INIT_DATA: {
      return {
        ...state,
        ...action.data,
        hasInit: true,
      };
    }
    case ADD_ITEM: {
      const newList = [
        ...state.tagList,
        {
          tagName: DEFAULT_NAME,
          key: '',
          value: DEFAULT_VALUE,
          prefix: false,
        },
      ];
      return {
        ...state,
        tagList: newList,
        ...filterErrorList(newList),
      };
    }
    case UPDATE_ITEM: {
      const newList = state.tagList;
      newList[action.index] = action.data;
      return {
        ...state,
        tagList: newList,
        ...filterErrorList(newList),
      };
    }
    case DELETE_ITEM: {
      state.tagList.splice(action.index, 1);
      return {
        ...state,
        tagList: state.tagList,
        ...filterErrorList(state.tagList),
      };
    }
    default: {
      return state;
    }
  }
};

// https://grafana.com/docs/grafana/latest/datasources/prometheus/#query-variable 根据文档解析表达式
// 每一个promtheus接口都接受start和end参数来限制返回值
export const convertExpressionToQuery = (expression: string, range: Range) => {
  const { start, end } = formatPickerDate(range);
  if (expression === 'label_names()') {
    return getLabelNames({ start, end }).then((res) => res.data);
  } else if (expression.startsWith('label_values(')) {
    if (expression.includes(',')) {
      let metricsAndLabel = expression.substring('label_values('.length, expression.length - 1).split(',');
      const label = metricsAndLabel.pop();
      const metric = metricsAndLabel.join(', ');
      return getMetricSeries({ 'match[]': metric.trim(), start, end }).then((res) => Array.from(new Set(res.data.map((item) => item[label!.trim()]))));
    } else {
      const label = expression.substring('label_values('.length, expression.length - 1);
      return getLabelValues(label, { start, end }).then((res) => res.data);
    }
  } else if (expression.startsWith('metrics(')) {
    const metric = expression.substring('metrics('.length, expression.length - 1);
    return getMetric({ start, end }).then((res) => res.data.filter((item) => item.includes(metric)));
  } else if (expression.startsWith('query_result(')) {
    const promql = expression.substring('query_result('.length, expression.length - 1);
    return getQueryResult({ query: promql, start, end }).then((res) =>
      res.data.result.map(({ metric, value }) => {
        const metricName = metric['__name__'];
        const labels = Object.keys(metric)
          .filter((ml) => ml !== '__name__')
          .map((label) => `${label}="${metric[label]}"`);
        const values = value.join(' ');
        return `${metricName || ''} {${labels}} ${values}`;
      }),
    );
  }
  return Promise.resolve(expression.length > 0 ? expression.split(',').map((i) => i.trim()) : '');
};

export const replaceExpressionVars = (expression: string, formData: FormType, limit: number, id: string) => {
  var newExpression = expression;
  const vars = newExpression.match(/\$[0-9a-zA-Z_]+/g);
  if (vars && vars.length > 0) {
    for (let i = 0; i < limit; i++) {
      const { name, options, reg } = formData.var[i];
      const selected = getVaraiableSelected(name, id);

      if (vars.includes('$' + name) && selected) {
        if (Array.isArray(selected)) {
          if (selected.includes('all') && options) {
            newExpression = newExpression.replaceAll(
              '$' + name,
              `(${(options as string[]).filter((i) => !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(i)).join('|')})`,
            );
          } else {
            newExpression = newExpression.replaceAll('$' + name, `(${(selected as string[]).join('|')})`);
          }
        } else if (typeof selected === 'string') {
          newExpression = newExpression.replaceAll('$' + name, selected as string);
        }
      }
    }
  }
  return newExpression;
};

export const extractExpressionVars = (expression: string) => {
  var newExpression = expression;
  const vars = newExpression.match(/\$[0-9a-zA-Z\._\-]+/g);
  return vars;
};

// const stringToRegex = (str) => {
//   // Main regex
//   const main = str.match(/\/(.+)\/.*/)[1];

//   // Regex options
//   const options = str.match(/\/.+\/(.*)/)[1];

//   // Compiled regex
//   return new RegExp(main, options);
// };

export function stringStartsAsRegEx(str: string): boolean {
  if (!str) {
    return false;
  }

  return str[0] === '/';
}

export function stringToRegex(str: string): RegExp | false {
  if (!stringStartsAsRegEx(str)) {
    return new RegExp(`^${str}$`);
  }

  const match = str.match(new RegExp('^/(.*?)/(g?i?m?y?)$'));

  // if (!match) {
  //   throw new Error(`'${str}' is not a valid regular expression.`);
  // }

  if (match) {
    return new RegExp(match[1], match[2]);
  } else {
    return false;
  }
}
