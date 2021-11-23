import { AreaChartOutlined, CloseCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import { Tabs, List, DatePicker, Radio, Button, Checkbox, Select, Alert } from 'antd';
import moment, { Moment } from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import ExpressionInput from './expressionInput';
import { prometheusAPI } from '@/services/metric';
import DateRangePicker, { formatPickerDate } from '@/components/DateRangePicker';
import Resolution from '@/components/Resolution';
import { Range, RelativeRange, AbsoluteRange } from '@/components/DateRangePicker';
import Graph from '@/components/Graph';
import { ErrorInfoType } from '@/components/Graph/Graph';

interface PanelProps {
  options: PanelOptions;
  metrics: string[];
  onOptionsChanged(opts: PanelOptions): void;
  removePanel: () => void;
}

export interface PanelOptions {
  expr: string;
  type: PanelType;
  range: number; // Range in milliseconds.
  endTime: number | null; // Timestamp in milliseconds.
  resolution: number; // Resolution in seconds.
  stacked: boolean;
  showExemplars: boolean;
}

export enum PanelType {
  Graph = 'graph',
  Table = 'table',
}

enum ChartType {
  Line = 'line',
  Area = 'area',
}

interface VectorDataType {
  resultType: 'vector';
  result: {
    metric: ResDataMetricType;
    value: [number, string];
  }[];
}

interface MatrixDataType {
  resultType: 'matrix';
  result: {
    metric: ResDataMetricType;
    values: [number, string][];
  }[];
}

interface ResDataMetricType {
  instance: string;
  job: string;
  quantile: string;
  __name__: string;
}

export const PanelDefaultOptions: PanelOptions = {
  type: PanelType.Table,
  expr: '',
  range: 5 * 60 * 1000,
  endTime: null,
  resolution: 15,
  stacked: false,
  showExemplars: false,
};

const { TabPane } = Tabs;
const { Option } = Select;

const Panel: React.FC<PanelProps> = ({ metrics, options, onOptionsChanged, removePanel }) => {
  // const Panel = (metrics, options, onOptionsChanged, removePanel) => {
  const graphRef = useRef(null);
  const inputValue = useRef('');
  const lastEndTime = useRef<number | null>(null);
  const optionsRecord = useRef(options);
  const abortInFlightFetch = useRef<(() => void) | null>(null);
  const [vectorData, setVectorData] = useState<VectorDataType | null>(null);
  const [chartType, setChartType] = useState<ChartType>(ChartType.Line);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorContent, setErrorContent] = useState<string>('');
  const [dateRangePickerValue, setDateRangePickerValue] = useState<Range>({ num: 1, unit: 'hour', description: 'hour' });
  const [isMultiSeries, setIsMultiSeries] = useState<boolean>(true);
  const [seriesOrderType, setSeriesOrderType] = useState<'desc' | 'asc'>('desc');

  function handleExpressionChange(value: string) {
    inputValue.current = value;
  }

  function handleTabChange(type: PanelType) {
    if (options.type !== type) {
      if (type === PanelType.Graph && lastEndTime.current !== optionsRecord.current.endTime) {
        if (optionsRecord.current.endTime === null) {
          setDateRangePickerValue({ num: 1, unit: 'hour', description: 'hour' });
        } else {
          setDateRangePickerValue({
            start: optionsRecord.current.endTime - 60 * 60 * 1000,
            end: optionsRecord.current.endTime,
          });
        }
      } else {
        lastEndTime.current = optionsRecord.current.endTime;
      }
      optionsRecord.current.type = type;
      setOptions({ type });
    }
  }

  function getEndTime(): number {
    return options.endTime === null ? moment().valueOf() : options.endTime;
  }

  function handleChangeEndTime(endTime: Moment | null): void {
    setOptions({ endTime: endTime ? endTime?.valueOf() : null });
  }

  function handleDateChange(e: Range) {
    const { start, end } = formatPickerDate(e);
    setOptions({
      endTime: e.hasOwnProperty('unit') ? null : end * 1000,
      range: (end - start) * 1000,
    });
  }

  function handleStepChange(v: number) {
    setOptions({ resolution: v });
  }

  function setOptions(opts: Partial<PanelOptions>): void {
    const newOpts = { ...optionsRecord.current, ...opts };
    optionsRecord.current = newOpts;
    onOptionsChanged(newOpts);
  }

  function onErrorOccured(errorArr: ErrorInfoType[]) {
    if (errorArr.length) {
      const errInfo = errorArr[0].error;
      setErrorContent(errInfo);
    } else {
      setErrorContent('');
    }
  }

  // 该函数传入输入框组件，只被初始化一次，注意产生的 props 和 state 不同步问题
  function executeQuery(isExecute: boolean = true) {
    if (!isExecute) return;
    const expr = inputValue.current;

    // 图标模式下直接调用图标组件的刷新方法
    if (optionsRecord.current.type === PanelType.Graph) {
      setOptions({ expr });
      return;
    }
    // 存储查询历史
    // this.props.onExecuteQuery(expr);
    // 设置外部 options 参数
    // if (this.props.options.expr !== expr) {
    //   this.setOptions({ expr });
    // }
    if (expr === '') {
      return;
    }

    // 如果正在进行上一个请求，那么终止
    if (abortInFlightFetch.current) {
      abortInFlightFetch.current();
      abortInFlightFetch.current = null;
    }

    // 设置一个新的请求控制器
    const abortController = new AbortController();
    abortInFlightFetch.current = () => abortController.abort();
    setIsLoading(true);

    // 初始化参数
    const endTime = getEndTime() / 1000;
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
      .then((res) => {
        console.log('res-----', res);
        abortInFlightFetch.current = null;
        setIsLoading(false);
        if (res.hasOwnProperty('status') && res.status === 'success') {
          setVectorData(res.data);
          setErrorContent('');
        } else {
          setVectorData(null);
          setErrorContent(res?.error || '');
        }
      })
      .catch((error) => {
        setIsLoading(false);
      });
  }

  // 当结束时间变更时，重新获取数据
  useEffect(() => {
    executeQuery();
  }, [options.endTime]);

  // 切换标签到 Table 时获取数据
  useEffect(() => {
    executeQuery(options.type === 'table');
  }, [options.type]);

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

      <Tabs className='panel-tab-box' type='card' activeKey={options.type} onChange={handleTabChange}>
        <TabPane tab='Table' key='table'>
          <div className='table-timestamp'>
            Timestamp:{' '}
            <DatePicker
              placeholder='Evaluation time'
              showTime
              showNow={false}
              disabledDate={(current) => current > moment()}
              value={optionsRecord.current.endTime ? moment(optionsRecord.current.endTime) : null}
              onChange={handleChangeEndTime}
            />
          </div>
          <List
            className='table-list'
            size='small'
            bordered
            loading={isLoading}
            dataSource={vectorData ? vectorData.result : []}
            renderItem={({ metric: { __name__: name, instance, job, quantile }, value }) => (
              <List.Item>{`${name}{instance="${instance}",job="${job}",quantile="${quantile}"} ${value[1]}`}</List.Item>
            )}
          />
        </TabPane>
        <TabPane tab='Graph' key='graph'>
          {/* 操作栏 */}
          <div className='graph-operate-box'>
            <div className='left'>
              <DateRangePicker value={dateRangePickerValue} unit='ms' onChange={handleDateChange} />
              <Resolution onChange={handleStepChange} initialValue={options.resolution} />
              <Radio.Group
                options={[
                  { label: <LineChartOutlined />, value: ChartType.Line },
                  { label: <AreaChartOutlined />, value: ChartType.Area },
                ]}
                onChange={(e) => {
                  e.preventDefault();
                  setChartType(e.target.value);
                }}
                value={chartType}
                optionType='button'
                buttonStyle='solid'
              />
            </div>
            <div className='right'>
              <Checkbox
                checked={isMultiSeries}
                onChange={(e) => {
                  console.log(e.target.checked);
                  setIsMultiSeries(e.target.checked);
                }}
              >
                Multi Series in Tooltip, order value
              </Checkbox>
              <Select value={seriesOrderType} onChange={(v: 'desc' | 'asc') => setSeriesOrderType(v)}>
                <Option value='desc'>desc</Option>
                <Option value='asc'>asc</Option>
              </Select>
            </div>
          </div>
          {/* 图 */}
          <div>
            {options.type === PanelType.Graph && (
              <Graph
                ref={graphRef}
                showHeader={false}
                data={{
                  step: options.resolution,
                  range: {
                    start: (getEndTime() - options.range) / 1000,
                    end: getEndTime() / 1000,
                  },
                  promqls: [inputValue],
                  // chartTypeOptions: {
                  //   chartType,
                  // },
                  legend: true,
                }}
                highLevelConfig={{
                  shared: isMultiSeries,
                  sharedSortDirection: seriesOrderType,
                }}
                onErrorOccured={onErrorOccured}
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
