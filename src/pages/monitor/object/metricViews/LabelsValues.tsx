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
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Select, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getLabelValues } from '@/services/metricViews';
import { Range } from '@/components/DateRangePicker';
import { IMatch } from '../types';
import { getFiltersStr, getDynamicLabelsStr } from './utils';

interface IProps {
  range: Range;
  value: IMatch;
  onChange: (value: IMatch) => void;
}

export default function LabelsValues(props: IProps) {
  const { value, range, onChange } = props;
  const { filters, dynamicLabels, dimensionLabel } = value;
  const [labelValues, setLabelValues] = useState<{ [key: string]: string[] }>({});
  const [dimensionLabelValues, setDimensionLabelValues] = useState<string[]>([]);
  const [dimensionLabelSearch, setDimensionLabelSearch] = useState('');
  const filtersStr = getFiltersStr(filters);
  const dynamicLabelsStr = getDynamicLabelsStr(dynamicLabels);

  useEffect(() => {
    const dynamicLabelsRequests = _.map(dynamicLabels, (item) => {
      return getLabelValues(item.label, range, filtersStr ? `{${filtersStr}}` : '');
    });
    Promise.all(dynamicLabelsRequests).then((res) => {
      const _labelValues = {};
      _.forEach(res, (item, idx) => {
        _labelValues[dynamicLabels[idx].label] = item;
      });
      setLabelValues({
        ...labelValues,
        ..._labelValues,
      });
    });
  }, [filtersStr]);

  useEffect(() => {
    if (!dimensionLabel.label) return;
    const matchArr = _.join(_.compact(_.concat(filtersStr, dynamicLabelsStr)), ',');
    getLabelValues(dimensionLabel.label, range, matchArr ? `{${matchArr}}` : '').then((res) => {
      if (_.isEmpty(dimensionLabel.value)) {
        onChange({
          ...value,
          dimensionLabel: {
            ...value.dimensionLabel,
            value: [_.head(res)],
          },
        });
      }
      setDimensionLabelValues(res);
    });
  }, [dynamicLabelsStr, dimensionLabel.label]);

  return (
    <div className='n9e-metric-views-labels-values'>
      <div>
        <div className='page-title'>前置过滤条件</div>
        <div className='n9e-metric-views-filters'>{filtersStr ? filtersStr : '暂无数据'}</div>
      </div>
      <div>
        <div className='page-title'>动态过滤条件</div>
        <div className='n9e-metric-views-dynamicLabels'>
          {_.isEmpty(dynamicLabels) ? (
            <div style={{ marginBottom: 18 }}>暂无数据</div>
          ) : (
            _.map(dynamicLabels, (item) => {
              return (
                <div key={item.label} className='n9e-metric-views-dynamicLabels-item'>
                  <div className='n9e-metric-views-dynamicLabels-item-label'>{item.label}:</div>
                  <Select
                    allowClear
                    style={{ width: '100%' }}
                    value={item.value}
                    onChange={(val) => {
                      const _dynamicLabels = _.map(dynamicLabels, (obj) => {
                        if (item.label === obj.label) {
                          return {
                            ...obj,
                            value: val,
                          };
                        }
                        return obj;
                      });
                      onChange({
                        ...value,
                        dynamicLabels: _dynamicLabels,
                      });
                    }}
                  >
                    {_.map(labelValues[item.label], (value) => {
                      return (
                        <Select.Option key={value} value={value}>
                          {value}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div>
        <div className='page-title'>展开维度标签：{dimensionLabel.label}</div>
        <div className='n9e-metric-views-dimensionLabel'>
          <Input
            prefix={<SearchOutlined />}
            value={dimensionLabelSearch}
            onChange={(e) => {
              setDimensionLabelSearch(e.target.value);
            }}
          />
          <div className='n9e-metric-views-dimensionLabel-content'>
            {_.isEmpty(dimensionLabelValues) ? (
              '暂无数据'
            ) : (
              <div>
                {_.map(
                  _.filter(dimensionLabelValues, (item) => {
                    return item.indexOf(dimensionLabelSearch) > -1;
                  }),
                  (item: string) => {
                    return (
                      <div
                        key={item}
                        className={classNames({
                          'n9e-metric-views-dimensionLabel-content-item': true,
                          active: _.includes(dimensionLabel.value, item),
                        })}
                        onClick={() => {
                          if (_.includes(dimensionLabel.value, item)) {
                            onChange({
                              ...value,
                              dimensionLabel: {
                                ...value.dimensionLabel,
                                value: _.without(dimensionLabel.value, item),
                              },
                            });
                          } else {
                            onChange({
                              ...value,
                              dimensionLabel: {
                                ...value.dimensionLabel,
                                value: _.compact(_.concat(dimensionLabel.value, item)),
                              },
                            });
                          }
                        }}
                      >
                        {item}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
