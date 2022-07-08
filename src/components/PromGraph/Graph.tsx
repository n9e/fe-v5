import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Space, InputNumber } from 'antd';
import TsGraph from '@fc-plot/ts-graph';
import '@fc-plot/ts-graph/dist/index.css';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getPromData } from './services';
import { QueryStats } from './QueryStatsView';

interface IProps {
  datasourceId: number;
  promql?: string;
  setQueryStats: (stats: QueryStats) => void;
  setErrorContent: (content: string) => void;
  contentMaxHeight: number;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  step?: number;
  setStep: (step?: number) => void;
}

const getSerieName = (metric: any) => {
  const metricName = metric?.__name__ || '';
  const labels = _.keys(metric)
    .filter((ml) => ml !== '__name__')
    .map((label) => {
      return `${label}="${metric[label]}"`;
    });

  return `${metricName}{${_.join(labels, ',')}}`;
};

export default function Graph(props: IProps) {
  const { datasourceId, promql, setQueryStats, setErrorContent, contentMaxHeight, range, setRange, step, setStep } = props;
  const [data, setData] = useState();
  const eleRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<TsGraph>(null);

  useEffect(() => {
    if (datasourceId && promql) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).unix();
      const end = moment(parsedRange.end).unix();
      let realStep = step;
      if (!step) realStep = Math.max(Math.floor((end - start) / 250), 1);
      const queryStart = Date.now();
      getPromData(
        '/api/v1/query_range',
        {
          query: promql,
          start: moment(parsedRange.start).unix(),
          end: moment(parsedRange.end).unix(),
          step: realStep,
        },
        { 'X-Data-Source-Id': datasourceId },
      )
        .then((res) => {
          const series = _.map(res?.result, (item) => {
            return {
              name: getSerieName(item.metric),
              data: item.values,
            };
          });
          setQueryStats({
            loadTime: Date.now() - queryStart,
            resolution: step,
            resultSeries: series.length,
          });
          setData(series);
        })
        .catch((err) => {
          const msg = _.get(err, 'data.error');
          setErrorContent(`Error executing query: ${msg}`);
        });
    }
  }, [JSON.stringify(range), step, datasourceId, promql]);

  useEffect(() => {
    return () => {
      if (chartRef.current && typeof chartRef.current.destroy === 'function') {
        chartRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!_.isEmpty(data) && eleRef.current) {
      if (!chartRef.current) {
        chartRef.current = new TsGraph({
          timestamp: 'X',
          xkey: '0',
          ykey: '1',
          ykeyFormatter: (value) => Number(value),
          chart: {
            renderTo: eleRef.current,
          },
          line: {
            width: 1,
          },
          series: _.cloneDeep(data),
        });
      } else {
        chartRef.current.update({
          series: _.cloneDeep(data),
        });
      }
    }
  }, [JSON.stringify(data)]);

  return (
    <div className='prom-graph-graph-container'>
      <div className='prom-graph-graph-controls'>
        <Space>
          <TimeRangePicker value={range} onChange={setRange} />
          <InputNumber
            placeholder='Res. (s)'
            value={step}
            onKeyDown={(e: any) => {
              if (e.code === 'Enter') {
                setStep(_.toNumber(e.target.value));
              }
            }}
            onBlur={(e) => {
              setStep(_.toNumber(e.target.value));
            }}
          />
        </Space>
      </div>
      <div style={{ height: contentMaxHeight }} ref={eleRef} />
    </div>
  );
}
