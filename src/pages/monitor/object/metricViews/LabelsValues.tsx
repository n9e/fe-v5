import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Select, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getLabelValues } from '@/services/metricViews';
import { Range } from '@/components/DateRangePicker';
import { IMatch } from '../types';
import { getFiltersStr } from './utils';

interface IProps {
  range: Range;
  value: IMatch;
  onChange: (value: IMatch) => void;
}

export default function LabelsValues(props: IProps) {
  const { value, range, onChange } = props;
  const { filters, dynamicLabels, dimensionLabel } = value;
  const [labelValues, setLabelValues] = useState<{ [key: string]: string[] }>({});
  const [dimensionLabelSearch, setDimensionLabelSearch] = useState('');
  const filtersStr = getFiltersStr(filters);

  useEffect(() => {
    const labels = _.compact(_.concat(_.map(dynamicLabels, 'label'), dimensionLabel.label));
    const _labelValues = {};
    const request = _.map(labels, (label) => {
      return getLabelValues(label, range);
    });
    Promise.all(request).then((res) => {
      _.forEach(res, (item, idx) => {
        _labelValues[labels[idx]] = item;
      });
      setLabelValues(_labelValues);
    });
  }, [JSON.stringify(value)]);

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
                        if ((item.label = obj.label)) {
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
            {_.isEmpty(labelValues[dimensionLabel.label]) ? (
              '暂无数据'
            ) : (
              <div>
                {_.map(
                  _.filter(labelValues[dimensionLabel.label], (item) => {
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
