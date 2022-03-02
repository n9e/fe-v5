import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import TsGraph from '@fc-plot/ts-graph';
import '@fc-plot/ts-graph/dist/index.css';
import { Range } from '@/components/DateRangePicker';
import usePrometheus from './datasource/usePrometheus';
import { ITarget } from '../types';

interface IProps {
  time: Range;
  step: number | null;
  targets: ITarget[];
}

export default function index(props: IProps) {
  const chartEleRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<TsGraph>(null);
  const { series } = usePrometheus(props);

  useEffect(() => {
    if (chartEleRef.current) {
      if (!chartRef.current) {
        chartRef.current = new TsGraph({
          timestamp: 'X',
          xkey: 0,
          ykey: 1,
          ykeyFormatter: (value) => Number(value),
          chart: {
            renderTo: chartEleRef.current,
            height: 200,
          },
          series: [],
          line: {
            width: 1,
          },
          curve: {
            enabled: true,
            mode: 'smooth',
          },
        });
      }
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update({
        series,
      });
    }
  }, [JSON.stringify(series)]);

  return (
    <div style={{ border: '1px solid #d9d9d9', height: 200 }}>
      <div ref={chartEleRef} />
    </div>
  );
}
