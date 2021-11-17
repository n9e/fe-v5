import { CloseCircleOutlined } from '@ant-design/icons';
import { Tabs, List, DatePicker } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import ExpressionInput from './expressionInput';
import { prometheusAPI } from '@/services/metric';

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
  resolution: number | null; // Resolution in seconds.
  stacked: boolean;
  showExemplars: boolean;
}

export enum PanelType {
  Graph = 'graph',
  Table = 'table',
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
  range: 60 * 60 * 1000,
  endTime: null,
  resolution: null,
  stacked: false,
  showExemplars: false,
};

const { TabPane } = Tabs;

const Panel: React.FC<PanelProps> = ({ metrics, options, onOptionsChanged, removePanel }) => {
  const inputValue = useRef('');
  const curTabType = useRef(options.type);
  curTabType.current = options.type;
  const [vectorData, setVectorData] = useState<VectorDataType | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixDataType | null>(null);
  const abortInFlightFetch = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  function handleExpressionChange(value: string) {
    inputValue.current = value;
  }

  function getEndTime(): number | moment.Moment {
    return options.endTime === null ? moment() : options.endTime;
  }

  function handleChangeEndTime(endTime: number | null): void {
    setOptions({ endTime });
  }

  function setOptions(opts: Partial<PanelOptions>): void {
    const newOpts = { ...options, ...opts };
    onOptionsChanged(newOpts);
  }

  function executeQuery() {
    const expr = inputValue.current;
    const queryStart = Date.now();
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
    const endTime = getEndTime().valueOf() / 1000;
    const startTime = endTime - options.range / 1000;
    const resolution = options.resolution || Math.max(Math.floor(options.range / 250000), 1);
    const params: URLSearchParams = new URLSearchParams({
      query: expr,
    });

    // 判断请求路径，设置请求需要的参数
    let path: string;
    switch (curTabType.current) {
      case 'graph':
        path = 'query_range';
        params.append('start', startTime.toString());
        params.append('end', endTime.toString());
        params.append('step', resolution.toString());
        break;
      case 'table':
        path = 'query';
        params.append('time', endTime.toString());
        break;
      default:
        throw new Error('Invalid panel type "' + options.type + '"');
    }

    let exemplars;

    prometheusAPI(path, params, {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: abortController.signal,
    })
      .then((res) => {
        setIsLoading(false);
        // 判断一下是不是最后一个请求
        console.log('res-----', res);
        let resultSeries = 0;
        if (res.data) {
          const { resultType, result } = res.data;
          if (resultType === 'scalar') {
            resultSeries = 1;
          } else if (result && result.length > 0) {
            resultSeries = result.length;
          }
        }

        curTabType.current === 'table' ? setVectorData(res.data) : setMatrixData(res.data);

        // this.setState({
        //   error: null,
        //   data: query.data,
        //   exemplars: exemplars?.data,
        //   warnings: query.warnings,
        //   lastQueryParams: {
        //     startTime,
        //     endTime,
        //     resolution,
        //   },
        //   stats: {
        //     loadTime: Date.now() - queryStart,
        //     resolution,
        //     resultSeries,
        //   },
        //   loading: false,
        // });
        // this.abortInFlightFetch = null;
      })
      .catch((error) => {
        setIsLoading(false);
        // this.setState({
        //   error: 'Error executing query: ' + error.message,
        // });
      });
  }

  // 当结束时间变更时，重新获取数据
  useEffect(() => {
    executeQuery();
  }, [options.endTime]);

  return (
    <div className='panel'>
      <ExpressionInput
        queryHistory={[]}
        value={inputValue.current}
        onExpressionChange={handleExpressionChange}
        metricNames={metrics}
        isLoading={isLoading}
        executeQuery={executeQuery}
      />
      <Tabs
        type='card'
        activeKey={options.type}
        onChange={(type: PanelType) => {
          if (options.type !== type) {
            setOptions({ type });
          }
        }}
      >
        <TabPane tab='Table' key='table'>
          <div>
            Timestamp:{' '}
            <DatePicker
              placeholder='Evaluation time'
              showTime
              onChange={(moment) => {
                handleChangeEndTime(moment ? moment.valueOf() : null);
              }}
            />
          </div>
          <List
            size='small'
            bordered
            dataSource={vectorData ? vectorData.result : []}
            renderItem={({ metric: { __name__: name, instance, job, quantile }, value }) => (
              <List.Item>{`${name}{instance="${instance}",job="${job}",quantile="${quantile}"} ${value[1]}`}</List.Item>
            )}
          />
        </TabPane>
        <TabPane tab='Graph' key='graph'>
          Content of Tab Pane 2
        </TabPane>
      </Tabs>
      <span className='remove-panel-btn' onClick={removePanel}>
        <CloseCircleOutlined />
      </span>
    </div>
  );
};

export default Panel;
