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
import { AreaChartOutlined, CloseCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import { Tabs, List, DatePicker, Radio, Alert, Space } from 'antd';
import moment, { Moment } from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ExpressionInput from './expressionInput';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { prometheusAPI } from '@/services/metric';
import DateRangePicker, { isAbsoluteRange } from '@/components/DateRangePicker';
import Resolution from '@/components/Resolution';
import { Range, RelativeRange, AbsoluteRange } from '@/components/DateRangePicker';
import Graph from '@/components/Graph';
import { ErrorInfoType } from '@/components/Graph/Graph';
import { ChartType } from '@/components/D3Charts/src/interface';
import QueryStatsView, { QueryStats } from './QueryStatsView';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface PanelProps {
  metrics: string[];
  defaultPromQL: string;
  removePanel: () => void;
}

export interface PanelOptions {
  type: PanelType;
  range: Range; // 单位为毫秒
  endTime: number | null; // 单位为毫秒
  resolution: number | null;
  stacked: boolean;
  showExemplars: boolean;
}

export enum PanelType {
  Graph = 'graph',
  Table = 'table',
}

interface VectorDataType {
  resultType: 'matrix' | 'vector' | 'scalar' | 'string';
  result: {
    metric: {
      instance: string;
      job: string;
      quantile: string;
      __name__: string;
    };
    value?: [number, string];
    values?: [number, string][];
  }[];
}

const { TabPane } = Tabs;

// 格式化 Table 列表数据
function getListItemContent(resultType, metrics) {
  if (resultType === 'scalar') return 'scalar';
  if (resultType === 'string') return 'string';
  const metricName = metrics?.__name__;
  const labels = _.keys(metrics)
    .filter((ml) => ml !== '__name__')
    .map((label, i, labels) => (
      <span key={i}>
        <span className='bold-text'>{label}</span>="{metrics[label]}"{i === labels.length - 1 ? '' : ', '}
      </span>
    ));
  return (
    <>
      {metricName}
      {'{'}
      {labels}
      {'}'}
    </>
  );
}

const Panel: React.FC<PanelProps> = ({ metrics, defaultPromQL, removePanel }) => {
  const { t } = useTranslation();
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const curPanelTab = useRef<PanelType>(PanelType.Table);
  const graphRef = useRef(null);
  const inputValue = useRef(defaultPromQL);
  const lastEndTime = useRef<number | null>(null);
  const abortInFlightFetch = useRef<(() => void) | null>(null);

  // 公共状态
  const [queryStats, setQueryStats] = useState<QueryStats | null>(null);
  const [chartType, setChartType] = useState<ChartType>(ChartType.Line);
  const [optionsRecord, setOptionsRecord] = useState<PanelOptions>({
    type: PanelType.Table,
    range: { num: 1, unit: 'hour', description: t('小时') },
    endTime: null,
    resolution: null,
    stacked: false,
    showExemplars: false,
  });
  const [errorContent, setErrorContent] = useState<string>('');
  // Table 相关状态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [vectorData, setVectorData] = useState<VectorDataType | null>(null);

  // 更新输入框表达式内容
  function handleExpressionChange(value: string) {
    inputValue.current = value;
  }

  function handleTabChange(type: PanelType) {
    if (optionsRecord.type !== type) {
      // 同步 Table 页时间戳和 Graph 时间选择组件的时间
      if (type === PanelType.Graph && lastEndTime.current !== optionsRecord.endTime) {
        if (optionsRecord.endTime === null) {
          setOptions({ range: { num: 1, unit: 'hour', description: 'hour' } });
        } else {
          setOptions({
            range: {
              start: optionsRecord.endTime - 60 * 60,
              end: optionsRecord.endTime,
            },
          });
        }
      } else {
        lastEndTime.current = optionsRecord.endTime;
      }

      curPanelTab.current = type;
      setOptions({ type });
      setQueryStats(null);
    }
  }

  // 获取请求的结束时间戳
  function getEndTime(endTime = optionsRecord.endTime): number {
    return endTime === null ? moment().unix() : endTime;
  }

  // 更新时间戳
  function handleTimestampChange(endTime: Moment | null): void {
    setOptions({ endTime: endTime ? endTime?.unix() : null });
  }

  function setOptions(opts: Partial<PanelOptions>): void {
    setOptionsRecord((optionsRecord) => ({ ...optionsRecord, ...opts }));
  }

  // 图表选中时间改变，触发更新
  function handleGraphDateChange(range: Range) {
    const prevRange = optionsRecord.range;
    if (isAbsoluteRange(range) ? !_.isEqual(prevRange, range) : range.num !== (prevRange as RelativeRange).num || range.unit !== (prevRange as RelativeRange).unit) {
      const endTime = range.hasOwnProperty('unit') ? null : (range as AbsoluteRange).end;
      setOptions({
        endTime,
        range,
      });
    }
  }

  // 图表请求完成，回填请求信息
  function onGraphRequestCompleted(newQueryStats: QueryStats) {
    if (curPanelTab.current === PanelType.Graph) {
      setQueryStats(newQueryStats);
    }
  }

  // 触发语句查询
  function executeQuery(isExecute: boolean = true) {
    const expr = inputValue.current;
    if (!isExecute || expr === '' || clusters.length === 0) return;

    // 模式下直接调用图表组件的刷新方法
    if (curPanelTab.current === PanelType.Graph) {
      setQueryStats(null);
      graphRef.current && (graphRef.current as any).refresh();
      return;
    }
    // 存储查询历史
    // this.props.onExecuteQuery(expr);
    // 设置外部 options 参数
    // if (this.props.optionsRecord.expr !== expr) {
    //   this.setOptions({ expr });
    // }

    // 如果正在进行上一个请求，那么终止
    if (abortInFlightFetch.current) {
      abortInFlightFetch.current();
      abortInFlightFetch.current = null;
    }

    // 设置一个新的请求控制器
    const abortController = new AbortController();
    abortInFlightFetch.current = () => abortController.abort();
    setIsLoading(true);
    setQueryStats(null);
    const queryStart = Date.now();

    // 初始化参数
    const endTime = getEndTime();
    const params: URLSearchParams = new URLSearchParams({
      query: expr,
    });

    // 设置请求需要的参数
    let path = 'query';
    params.append('time', endTime.toString());

    prometheusAPI(path, params, {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: abortController.signal,
    })
      .then((res: any) => {
        abortInFlightFetch.current = null;
        setIsLoading(false);
        if (curPanelTab.current === PanelType.Graph) {
          return;
        }
        if (res.hasOwnProperty('status') && res.status === 'success') {
          var tooLong = false;
          var LENGTH = 10000;
          var maxLength = 0;
          let { resultType, result } = res.data;
          if (result) {
            if (result.length > LENGTH) {
              tooLong = true;
              maxLength = result.length;
              result = result.slice(LENGTH);
            }
            result.forEach((item) => {
              if (item.values && item.values.length > LENGTH) {
                tooLong = true;
                if (item.values.length > maxLength) {
                  maxLength = item.values.length;
                }
                item.values = item.values.slice(LENGTH);
              }
            });
          }
          if (tooLong) {
            setErrorContent(`Warning：Fetched ${maxLength} metrics, only displaying first ${LENGTH}`);
          } else {
            setErrorContent('');
          }
          if (resultType === 'scalar' || resultType === 'string') {
            setVectorData({ resultType, result: [result] });
          } else {
            setVectorData({ resultType, result });
          }
          setQueryStats({
            loadTime: Date.now() - queryStart,
            resultSeries: res.data.result.length,
          });
        } else {
          setVectorData(null);
          setErrorContent(res?.error || '');
        }
      })
      .catch((error) => {
        setIsLoading(false);
      });
  }

  // 请求发生错误时，展示错误信息
  function onErrorOccured(errorArr: ErrorInfoType[]) {
    if (errorArr.length) {
      const errInfo = errorArr[0].error;
      setErrorContent(errInfo);
    } else {
      setErrorContent('');
    }
  }

  // 当时间戳变更时，重新获取数据
  useEffect(() => {
    optionsRecord.type === PanelType.Table && executeQuery();
  }, [optionsRecord.endTime, clusters]);

  // 切换标签到 Table 时获取数据
  useEffect(() => {
    optionsRecord.type === PanelType.Table && executeQuery();
  }, [optionsRecord.type, clusters]);

  return (
    <div className='panel'>
      {/* 输入框 */}
      <ExpressionInput
        queryHistory={['abs(go_gc_duration_seconds)']}
        value={inputValue.current}
        onExpressionChange={handleExpressionChange}
        metricNames={metrics}
        isLoading={isLoading}
        executeQuery={executeQuery}
      />
      {errorContent && <Alert className='error-alert' message={errorContent} type='error' />}
      {!isLoading && !errorContent && queryStats && <QueryStatsView {...queryStats} />}
      <Tabs className='panel-tab-box' type='card' activeKey={optionsRecord.type} onChange={handleTabChange}>
        <TabPane tab='Table' key='table'>
          <div className='table-timestamp'>
            Timestamp:{' '}
            <DatePicker
              placeholder='Evaluation time'
              showTime
              showNow={false}
              disabledDate={(current) => current > moment()}
              value={optionsRecord.endTime ? moment(optionsRecord.endTime * 1000) : null}
              onChange={handleTimestampChange}
            />
          </div>
          <List
            className='table-list'
            size='small'
            bordered
            loading={isLoading}
            dataSource={vectorData ? vectorData.result : []}
            renderItem={(item) => {
              const { metric, value, values } = item;
              return (
                <List.Item>
                  <div className='list-item-content'>
                    <div className='left'>{getListItemContent(vectorData?.resultType, metric)}</div>
                    {vectorData?.resultType === 'scalar' || vectorData?.resultType === 'string' ? (
                      item[1]
                    ) : (
                      <div>
                        {value && value.length > 1 && <div className='right'>{value[1] || '-'}</div>}
                        {values && values.length > 0 && (
                          <div className='right'>
                            {values.map((value) => {
                              return (
                                <>
                                  {value && value.length > 1 && (
                                    <span style={{ display: 'inline-block' }}>
                                      {value[1]} @{value[0]}
                                    </span>
                                  )}
                                  <br />
                                </>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        </TabPane>
        <TabPane tab='Graph' key='graph'>
          {/* 操作栏 */}
          <div className='graph-operate-box'>
            <div className='left'>
              <Space>
                <DateRangePicker placement='bottomRight' value={optionsRecord.range} onChange={handleGraphDateChange} />
                <Resolution onChange={(v: number) => setOptions({ resolution: v })} initialValue={optionsRecord.resolution} />
                <Radio.Group
                  options={[
                    { label: <LineChartOutlined />, value: ChartType.Line },
                    { label: <AreaChartOutlined />, value: ChartType.StackArea },
                  ]}
                  onChange={(e) => {
                    e.preventDefault();
                    setChartType(e.target.value);
                  }}
                  value={chartType}
                  optionType='button'
                  buttonStyle='solid'
                />
              </Space>
            </div>
          </div>
          {/* 图 */}
          <div>
            {optionsRecord.type === PanelType.Graph && (
              <Graph
                ref={graphRef}
                showHeader={true}
                isShowRefresh={false}
                data={{
                  step: optionsRecord.resolution,
                  range: optionsRecord.range,
                  promqls: [inputValue],
                  chartType: chartType,
                }}
                onErrorOccured={onErrorOccured}
                onRequestCompleted={onGraphRequestCompleted}
              />
            )}
          </div>
        </TabPane>
      </Tabs>
      <span className='remove-panel-btn' onClick={removePanel}>
        <CloseCircleOutlined />
      </span>
    </div>
  );
};

export default Panel;
