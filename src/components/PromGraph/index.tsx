/**
 * 类似 prometheus graph 的组件
 */
import React, { useState, useRef, useEffect } from 'react';
import { Input, Tabs, Button, Alert } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import PromQLInput from '../PromQLInput';
import Table from './Table';
import Graph from './Graph';
import QueryStatsView, { QueryStats } from './QueryStatsView';
import MetricsExplorer from './MetricsExplorer';
import './style.less';

interface IProps {
  url?: string;
  datasourceId?: number;
  datasourceIdRequired?: boolean;
  contentMaxHeight?: number;
  type?: 'table' | 'graph';
  defaultTime?: IRawTimeRange | number;
  promQL?: string;
}

const TabPane = Tabs.TabPane;

export default function index(props: IProps) {
  const { url = '/api/v1/datasource/prometheus', datasourceId, datasourceIdRequired, promQL, contentMaxHeight = 300, type = 'table', defaultTime } = props;
  const [value, setValue] = useState<string | undefined>(promQL); // for promQLInput
  const [promql, setPromql] = useState<string | undefined>(promQL);
  const [queryStats, setQueryStats] = useState<QueryStats | null>(null);
  const [errorContent, setErrorContent] = useState('');
  const [tabActiveKey, setTabActiveKey] = useState(type);
  const [timestamp, setTimestamp] = useState<number>(); // for table
  const [range, setRange] = useState<IRawTimeRange>({ start: 'now-1h', end: 'now' }); // for graph
  const [step, setStep] = useState<number>(); // for graph
  const [metricsExplorerVisible, setMetricsExplorerVisible] = useState(false);
  const promQLInputRef = useRef<any>(null);

  useEffect(() => {
    if (typeof defaultTime === 'number') {
      if (tabActiveKey == 'table') {
        setTimestamp(defaultTime);
      }
    } else {
      if (defaultTime?.start && defaultTime?.end) {
        const parsedRange = parseRange(range);
        const end = moment(parsedRange.end).unix();
        setTimestamp(end);
        setRange(defaultTime);
      }
    }
  }, []);

  useEffect(() => {
    setValue(promql);
    setPromql(promql);
  }, [promql]);

  return (
    <div className='prom-graph-container'>
      <div className='prom-graph-expression-input'>
        <Input.Group>
          <span className='ant-input-group-addon'>PromQL</span>
          <span className='ant-input-affix-wrapper'>
            <PromQLInput
              ref={promQLInputRef}
              url={url}
              headers={
                datasourceIdRequired
                  ? {
                      'X-Data-Source-Id': _.toString(datasourceId),
                    }
                  : {
                      'X-Cluster': localStorage.getItem('curCluster') || 'DEFAULT',
                      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
                    }
              }
              value={value}
              onChange={setValue}
              executeQuery={(val) => {
                setPromql(val);
              }}
            />
            <span className='ant-input-suffix'>
              <GlobalOutlined
                className='prom-graph-metrics-target'
                onClick={() => {
                  setMetricsExplorerVisible(true);
                }}
              />
            </span>
          </span>
          <span
            className='ant-input-group-addon'
            style={{
              border: 0,
              padding: '0 0 0 10px',
              background: 'none',
            }}
          >
            <Button
              type='primary'
              onClick={() => {
                console.log('value', value);
                setPromql(value);
              }}
            >
              Execute
            </Button>
          </span>
        </Input.Group>
      </div>
      {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
      <Tabs
        destroyInactiveTabPane
        tabBarGutter={0}
        activeKey={tabActiveKey}
        onChange={(key: 'table' | 'graph') => {
          setTabActiveKey(key);
          setErrorContent('');
          setQueryStats(null);
        }}
        type='card'
        tabBarExtraContent={queryStats && <QueryStatsView {...queryStats} />}
      >
        <TabPane tab='Table' key='table'>
          <Table
            url={url}
            contentMaxHeight={contentMaxHeight}
            datasourceId={datasourceId}
            datasourceIdRequired={datasourceIdRequired}
            promql={promql}
            setQueryStats={setQueryStats}
            setErrorContent={setErrorContent}
            timestamp={timestamp}
            setTimestamp={setTimestamp}
          />
        </TabPane>
        <TabPane tab='Graph' key='graph'>
          <Graph
            url={url}
            contentMaxHeight={contentMaxHeight}
            datasourceId={datasourceId}
            datasourceIdRequired={datasourceIdRequired}
            promql={promql}
            setQueryStats={setQueryStats}
            setErrorContent={setErrorContent}
            range={range}
            setRange={setRange}
            step={step}
            setStep={setStep}
          />
        </TabPane>
      </Tabs>
      <MetricsExplorer
        datasourceId={datasourceId}
        show={metricsExplorerVisible}
        updateShow={setMetricsExplorerVisible}
        insertAtCursor={(val) => {
          if (promQLInputRef.current !== null) {
            const { from, to } = promQLInputRef.current.state.selection.ranges[0];
            promQLInputRef.current.dispatch(
              promQLInputRef.current.state.update({
                changes: { from, to, insert: val },
              }),
            );
          }
        }}
      />
    </div>
  );
}
