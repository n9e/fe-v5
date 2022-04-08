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
import { Card, Space, Dropdown, Menu, Tag, Popover } from 'antd';
import { ShareAltOutlined, SyncOutlined, CloseCircleOutlined, DownOutlined, PlusCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Range } from '@/components/DateRangePicker';
import { getLabels, getQueryRange, getExprs, setTmpChartData } from '@/services/metricViews';
import { getMatchStr } from './utils';
import { IMatch } from '../types';
import Timeseries from '../../../dashboard/Renderer/Renderer/Timeseries';
import GraphStandardOptions from './GraphStandardOptions';

interface IProps {
  metric: string;
  match: IMatch;
  range: Range;
  step?: number;
  onClose: () => void;
}

export default function Graph(props: IProps) {
  const { metric, match, range, step, onClose } = props;
  const newGroups = _.map(
    _.filter(match.dimensionLabels, (item) => !_.isEmpty(item.value)),
    'label',
  );
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [calcFunc, setCalcFunc] = useState('');
  const [comparison, setComparison] = useState<string[]>([]);
  const [aggrFunc, setAggrFunc] = useState('avg');
  const [aggrGroups, setAggrGroups] = useState<string[]>(newGroups);
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [highLevelConfig, setHighLevelConfig] = useState({
    shared: true,
    sharedSortDirection: 'desc',
    legend: true,
    util: 'none',
  });
  const graphProps = {
    custom: {
      drawStyle: 'lines',
      fillOpacity: 0,
      stack: 'hidden',
      lineInterpolation: 'smooth',
    },
    options: {
      legend: {
        displayMode: highLevelConfig.legend ? 'list' : 'hidden',
      },
      tooltip: {
        mode: highLevelConfig.shared ? 'all' : 'single',
        sort: highLevelConfig.sharedSortDirection,
      },
      standardOptions: {
        util: highLevelConfig.util,
      },
    },
  };

  useEffect(() => {
    setAggrGroups(newGroups);
  }, [JSON.stringify(newGroups)]);

  useEffect(() => {
    const matchStr = getMatchStr(match);
    getLabels(`${metric}${matchStr}`, range).then((res) => {
      setLabels(res);
    });
  }, [refreshFlag, JSON.stringify(match), JSON.stringify(range)]);

  useEffect(() => {
    getQueryRange({
      metric,
      match: getMatchStr(match),
      range,
      step,
      aggrFunc,
      aggrGroups,
      calcFunc,
      comparison,
    }).then((res) => {
      setSeries(res);
    });
  }, [refreshFlag, metric, JSON.stringify(match), JSON.stringify(range), step, calcFunc, comparison, aggrFunc, aggrGroups]);

  return (
    <Card
      size='small'
      style={{ marginBottom: 10 }}
      title={metric}
      extra={
        <Space>
          <Popover
            placement='left'
            content={<GraphStandardOptions highLevelConfig={highLevelConfig} setHighLevelConfig={setHighLevelConfig} />}
            trigger='click'
            autoAdjustOverflow={false}
            getPopupContainer={() => document.body}
          >
            <a>
              <SettingOutlined />
            </a>
          </Popover>
          <a>
            <SyncOutlined
              onClick={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            />
          </a>
          <a>
            <ShareAltOutlined
              onClick={() => {
                const curCluster = localStorage.getItem('curCluster');
                const dataProps = {
                  type: 'timeseries',
                  version: '2.0.0',
                  name: metric,
                  step,
                  range,
                  ...graphProps,
                  targets: _.map(
                    getExprs({
                      metric,
                      match: getMatchStr(match),
                      aggrFunc,
                      aggrGroups,
                      calcFunc,
                      comparison,
                    }),
                    (expr) => {
                      return {
                        expr,
                      };
                    },
                  ),
                };
                setTmpChartData([
                  {
                    configs: JSON.stringify({
                      curCluster,
                      dataProps,
                    }),
                  },
                ]).then((res) => {
                  const ids = res.dat;
                  window.open('/chart/' + ids);
                });
              }}
            />
          </a>
          <a>
            <CloseCircleOutlined onClick={onClose} />
          </a>
        </Space>
      }
    >
      <div>
        <Space>
          <div>
            计算函数：
            <Dropdown
              overlay={
                <Menu onClick={(e) => setCalcFunc(e.key === 'clear' ? '' : e.key)} selectedKeys={[calcFunc]}>
                  <Menu.Item key='rate_1m'>rate_1m</Menu.Item>
                  <Menu.Item key='rate_5m'>rate_5m</Menu.Item>
                  <Menu.Item key='increase_1m'>increase_1m</Menu.Item>
                  <Menu.Item key='increase_5m'>increase_5m</Menu.Item>
                  <Menu.Divider></Menu.Divider>
                  <Menu.Item key='clear'>clear</Menu.Item>
                </Menu>
              }
            >
              <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                {calcFunc || '无'} <DownOutlined />
              </a>
            </Dropdown>
          </div>
          <div>
            环比：
            {comparison.map((ag) => (
              <Tag
                key={ag}
                closable
                onClose={() => {
                  setComparison(_.without(comparison, ag));
                }}
              >
                {ag}
              </Tag>
            ))}
            <Dropdown
              overlay={
                <Menu
                  onClick={(e) => {
                    if (comparison.indexOf(e.key) === -1) {
                      setComparison([...comparison, e.key]);
                    } else {
                      setComparison(_.without(comparison, e.key));
                    }
                  }}
                  selectedKeys={comparison}
                >
                  <Menu.Item key='1d'>1d</Menu.Item>
                  <Menu.Item key='7d'>7d</Menu.Item>
                </Menu>
              }
              overlayStyle={{ maxHeight: 400, overflow: 'auto' }}
            >
              <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                <PlusCircleOutlined />
              </a>
            </Dropdown>
          </div>
          <div>
            聚合函数：
            <Dropdown
              overlay={
                <Menu onClick={(e) => setAggrFunc(e.key)} selectedKeys={[aggrFunc]}>
                  <Menu.Item key='sum'>sum</Menu.Item>
                  <Menu.Item key='avg'>avg</Menu.Item>
                  <Menu.Item key='max'>max</Menu.Item>
                  <Menu.Item key='min'>min</Menu.Item>
                </Menu>
              }
            >
              <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                {aggrFunc} <DownOutlined />
              </a>
            </Dropdown>
          </div>
          {aggrFunc ? (
            <div className='graph-config-inner-item'>
              聚合维度：
              {aggrGroups.map((ag) => (
                <Tag
                  key={ag}
                  closable
                  onClose={() => {
                    setAggrGroups(_.without(aggrGroups, ag));
                  }}
                >
                  {ag}
                </Tag>
              ))}
              <Dropdown
                overlay={
                  <Menu
                    onClick={(e) => {
                      if (aggrGroups.indexOf(e.key) === -1) {
                        setAggrGroups([...aggrGroups, e.key]);
                      } else {
                        setAggrGroups(_.without(aggrGroups, e.key));
                      }
                    }}
                    selectedKeys={aggrGroups}
                  >
                    {_.map(
                      _.filter(labels, (n) => n !== '__name__'),
                      (ag) => (
                        <Menu.Item key={ag}>{ag}</Menu.Item>
                      ),
                    )}
                  </Menu>
                }
                overlayStyle={{ maxHeight: 400, overflow: 'auto' }}
              >
                <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                  <PlusCircleOutlined />
                </a>
              </Dropdown>
            </div>
          ) : null}
        </Space>
      </div>
      <div>
        <Timeseries inDashboard={false} values={graphProps as any} series={series} />
      </div>
    </Card>
  );
}
