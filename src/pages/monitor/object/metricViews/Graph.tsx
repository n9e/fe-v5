import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Card, Space, Dropdown, Menu, Tag, Popover } from 'antd';
import { ShareAltOutlined, SyncOutlined, CloseCircleOutlined, DownOutlined, PlusCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Range } from '@/components/DateRangePicker';
import { getLabels, getQueryRange } from '@/services/metricViews';
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
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [calcFunc, setCalcFunc] = useState('');
  const [comparison, setComparison] = useState<string[]>([]);
  const [aggrFunc, setAggrFunc] = useState('avg');
  const [aggrGroups, setAggrGroups] = useState<string[]>([match.dimensionLabel.label]);
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [highLevelConfig, setHighLevelConfig] = useState({
    shared: true,
    sharedSortDirection: 'desc',
    legend: true,
    util: 'none',
  });

  useEffect(() => {
    getLabels(getMatchStr(match), range).then((res) => {
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
  }, [refreshFlag, metric, JSON.stringify(match), JSON.stringify(range), calcFunc, comparison, aggrFunc, aggrGroups]);

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
            <ShareAltOutlined />
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
        <Timeseries
          inDashboard={false}
          values={
            {
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
            } as any
          }
          series={series}
        />
      </div>
    </Card>
  );
}
