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
import { Select, Input, Tooltip, Button } from 'antd';
import { SearchOutlined, ClearOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
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
  const { id, refreshFlag, filters, dynamicLabels, dimensionLabels } = value;
  const [labelValues, setLabelValues] = useState<{ [key: string]: string[] }>({});
  const [dimensionLabelsValues, setDimensionLabelsValues] = useState<{ [key: string]: string[] }>({});
  const [dimensionLabelsSearch, setDimensionLabelsSearch] = useState({});
  const filtersStr = getFiltersStr(filters);
  const dynamicLabelsStr = getDynamicLabelsStr(dynamicLabels);
  const [expaned, setExpaned] = useState({
    filters: false,
    dynamicLabels: false,
  });

  useEffect(() => {
    const dynamicLabelsRequests = _.map(dynamicLabels, (item) => {
      return getLabelValues(item.label, range, filtersStr ? `{${filtersStr}}` : '');
    });
    Promise.all(dynamicLabelsRequests).then((res) => {
      const _labelValues = {};
      _.forEach(res, (item, idx) => {
        _labelValues[dynamicLabels[idx].label] = item;
      });
      setLabelValues(_labelValues);
    });
  }, [filtersStr]);

  useEffect(() => {
    const matchStr = _.join(_.compact(_.concat(filtersStr, dynamicLabelsStr)), ',');
    const dimensionLabelsRequests = _.map(dimensionLabels, (item) => {
      return getLabelValues(item.label, range, matchStr ? `{${matchStr}}` : '');
    });
    Promise.all(dimensionLabelsRequests).then((res) => {
      const _labelValues = {};
      _.forEach(res, (item, idx) => {
        _labelValues[dimensionLabels[idx].label] = item;
      });
      setDimensionLabelsValues(_labelValues);
      if (_.every(dimensionLabels, (item) => _.isEmpty(item.value))) {
        onChange({
          ...value,
          dimensionLabels: _.map(dimensionLabels, (item, idx) => {
            if (idx === 0) {
              return {
                label: item.label,
                value: [_.head(_labelValues[item.label])],
              };
            }
            return item;
          }),
        });
      }
    });
  }, [filtersStr, dynamicLabelsStr, id, refreshFlag]);

  return (
    <div className='n9e-metric-views-labels-values'>
      <div>
        <div
          className='page-title'
          style={{ marginTop: 6, cursor: 'pointer' }}
          onClick={() => {
            setExpaned({
              ...expaned,
              filters: !expaned.filters,
            });
          }}
        >
          前置过滤条件 {expaned.filters ? <UpOutlined /> : <DownOutlined />}
        </div>
        {expaned.filters && <div className='n9e-metric-views-filters'>{filtersStr ? filtersStr : '暂无数据'}</div>}
      </div>
      <div>
        <div
          className='page-title'
          style={{ marginTop: 20, cursor: 'pointer' }}
          onClick={() => {
            setExpaned({
              ...expaned,
              dynamicLabels: !expaned.dynamicLabels,
            });
          }}
        >
          动态过滤条件 {expaned.dynamicLabels ? <UpOutlined /> : <DownOutlined />}
        </div>
        {expaned.dynamicLabels && (
          <div className='n9e-metric-views-dynamicLabels'>
            {_.isEmpty(dynamicLabels) ? (
              <div style={{ marginBottom: 10 }}>暂无数据</div>
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
        )}
      </div>
      <div>
        {_.map(dimensionLabels, (dimensionLabel) => {
          const dimensionLabelValues = dimensionLabelsValues[dimensionLabel.label];
          return (
            <div key={dimensionLabel.label}>
              <div className='page-title' style={{ marginTop: 20 }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    width: 200,
                  }}
                >
                  <Tooltip title={dimensionLabel.label} placement='left'>
                    <div
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {dimensionLabel.label}
                    </div>
                  </Tooltip>
                </div>
              </div>
              <div className='n9e-metric-views-dimensionLabel'>
                <Input.Group compact>
                  <Input
                    style={{ width: 'calc(100% - 32px)' }}
                    prefix={<SearchOutlined />}
                    value={dimensionLabelsSearch[dimensionLabel.label]}
                    onChange={(e) => {
                      setDimensionLabelsSearch({
                        ...dimensionLabelsSearch,
                        [dimensionLabel.label]: e.target.value,
                      });
                    }}
                  />
                  <Tooltip title='清空已选的值' placement='right' getTooltipContainer={() => document.body}>
                    <Button
                      icon={<ClearOutlined />}
                      onClick={() => {
                        onChange({
                          ...value,
                          dimensionLabels: _.map(dimensionLabels, (item) => {
                            if (item.label === dimensionLabel.label) {
                              return {
                                ...item,
                                value: [],
                              };
                            }
                            return item;
                          }),
                        });
                      }}
                    />
                  </Tooltip>
                </Input.Group>

                <div className='n9e-metric-views-dimensionLabel-content'>
                  {_.isEmpty(dimensionLabelValues) ? (
                    '暂无数据'
                  ) : (
                    <div>
                      {_.map(
                        _.filter(dimensionLabelValues, (item) => {
                          let result = true;
                          if (dimensionLabelsSearch[dimensionLabel.label]) {
                            try {
                              const reg = new RegExp(dimensionLabelsSearch[dimensionLabel.label], 'gi');
                              result = reg.test(item);
                            } catch (e) {
                              console.log(e);
                            }
                          }
                          return result;
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
                                const dimensionLabelValue = _.includes(dimensionLabel.value, item) ? _.without(dimensionLabel.value, item) : _.concat(dimensionLabel.value, item);
                                const newDimensionLabels = _.map(dimensionLabels, (item) => {
                                  if (item.label === dimensionLabel.label) {
                                    return {
                                      ...item,
                                      value: _.compact(dimensionLabelValue),
                                    };
                                  }
                                  return {
                                    ...item,
                                    value: [],
                                  };
                                });
                                onChange({
                                  ...value,
                                  dimensionLabels: newDimensionLabels,
                                });
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
          );
        })}
      </div>
    </div>
  );
}
