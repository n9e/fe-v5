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
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Input, Card, Row, Col, Space, Button } from 'antd';
import { SearchOutlined, SyncOutlined } from '@ant-design/icons';
import DateRangePicker, { formatPickerDate } from '@/components/DateRangePicker';
import Graph from './Graph';
import Resolution from '@/components/Resolution';
import { Range } from '@/components/DateRangePicker';
import { getMetricValues } from '@/services/metricViews';
import { IMatch } from '../types';
import { getMatchStr } from './utils';

interface IProps {
  range: Range;
  setRange: (range: Range) => void;
  match: IMatch;
}

export default function Metrics(props: IProps) {
  const { range, setRange, match } = props;
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState([]);
  const [activeKey, setActiveKey] = useState('all');
  const [metricPrefixes, setMetricPrefixes] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [step, setStep] = useState<number>();
  const matchStr = getMatchStr(match);
  const renderMetricList = (metrics = [], metricTabKey: string) => {
    const filtered = _.filter(metrics, (metric) => {
      let flag = true;
      flag = metricTabKey === 'all' ? true : metric.indexOf(metricTabKey) === 0;
      if (flag && search) {
        try {
          const reg = new RegExp(search, 'i');
          flag = reg.test(metric);
        } catch (e) {
          flag = false;
        }
      }
      return flag;
    });
    return (
      <div className='tabPane' style={{ height: 240, overflow: 'auto' }}>
        {filtered.length ? (
          <ul className='n9e-metric-views-metrics-content' style={{ border: 'none' }}>
            {_.map(filtered, (metric, i) => {
              return (
                <li
                  className='item'
                  key={i}
                  onClick={() => {
                    setSelectedMetrics(_.union(_.concat(selectedMetrics, metric)));
                  }}
                >
                  <span>{metric}</span>
                  {_.find(selectedMetrics, (sm) => sm === metric) ? <span style={{ marginLeft: 8 }}>+1</span> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ textAlign: 'center' }}>No data</div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (matchStr) {
      getMetricValues(matchStr, range).then((res) => {
        const _metrics = _.union(res);
        const metricPrefixes = _.union(
          _.compact(
            _.map(_metrics, (m) => {
              return _.get(_.split(m, '_'), '[0]');
            }),
          ),
        );
        setMetrics(_metrics);
        setMetricPrefixes(metricPrefixes);
      });
    }
  }, [refreshFlag, matchStr]);

  return (
    <div className='n9e-metric-views-metrics'>
      <div>
        <div className='page-title'>监控指标</div>
        <div>
          {metrics.length > 0 ? (
            <>
              <div className='mt16 mb16'>
                <Input
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  placeholder='搜索，空格分隔多个关键字'
                  addonAfter={
                    <SyncOutlined
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setRefreshFlag(_.uniqueId('refreshFlag_'));
                      }}
                    />
                  }
                />
              </div>
              <Card
                size='small'
                style={{ width: '100%' }}
                tabList={_.map(['all', ...metricPrefixes], (item) => {
                  return {
                    key: item,
                    tab: item,
                  };
                })}
                activeTabKey={activeKey}
                onTabChange={setActiveKey}
              >
                <div>{renderMetricList(metrics, activeKey)}</div>
              </Card>
              <Row style={{ padding: '10px 0' }}>
                <Col span={8}>
                  <Space>
                    <DateRangePicker
                      value={range}
                      onChange={(e) => {
                        setRange(e);
                      }}
                    />
                    <Resolution
                      onChange={(v) => {
                        setStep(v === null ? undefined : v);
                      }}
                      initialValue={step}
                    />
                    <Button
                      style={{ padding: '4px 8px' }}
                      onClick={() => {
                        setRange({
                          ...range,
                          refreshFlag: _.uniqueId('refreshFlag_'),
                        });
                      }}
                      icon={<SyncOutlined />}
                    ></Button>
                  </Space>
                </Col>
                <Col span={16} style={{ textAlign: 'right' }}>
                  <Button
                    onClick={() => {
                      setSelectedMetrics([]);
                    }}
                    disabled={!selectedMetrics.length}
                    style={{ background: '#fff' }}
                  >
                    清空图表
                  </Button>
                </Col>
              </Row>
              <div>
                {_.map(selectedMetrics, (metric, i) => {
                  return (
                    <Graph
                      key={metric}
                      metric={metric}
                      match={match}
                      range={range}
                      step={step}
                      onClose={() => {
                        const newselectedMetrics = [...selectedMetrics];
                        newselectedMetrics.splice(i, 1);
                        setSelectedMetrics(newselectedMetrics);
                      }}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ marginTop: 12 }}>暂无指标数据，请选择左侧 Lables</div>
          )}
        </div>
      </div>
    </div>
  );
}
