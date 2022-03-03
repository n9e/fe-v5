import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import TsGraph from '@fc-plot/ts-graph';
import '@fc-plot/ts-graph/dist/index.css';
import { Range } from '@/components/DateRangePicker';
import usePrometheus from './datasource/usePrometheus';
import { IPanel } from '../types';

interface IProps {
  time: Range;
  step: number | null;
  values: IPanel;
}

export default function index(props: IProps) {
  const { values, time, step } = props;
  const { targets, custom, options } = values;
  const chartEleRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<TsGraph>(null);
  const { series } = usePrometheus({
    time,
    step,
    targets,
  });

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
          area: {
            opacity: custom.fillOpacity,
          },
          stack: {
            enabled: custom.stack === 'noraml',
          },
          curve: {
            enabled: true,
            mode: custom.lineInterpolation,
          },
          tooltip: {
            shared: options.tooltip?.mode === 'all',
            sharedSortDirection: options.tooltip?.sort !== 'none' ? options.tooltip?.sort : undefined,
          },
        });
      }
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update({
        series,
        area: {
          opacity: custom.fillOpacity,
        },
        stack: {
          enabled: custom.stack === 'noraml',
        },
        curve: {
          enabled: true,
          mode: custom.lineInterpolation,
        },
        tooltip: {
          shared: options.tooltip?.mode === 'all',
          sharedSortDirection: options.tooltip?.sort !== 'none' ? options.tooltip?.sort : undefined,
        },
      });
    }
  }, [JSON.stringify(series), JSON.stringify(custom)]);

  return (
    <div style={{ border: '1px solid #d9d9d9', height: 200 }}>
      <div ref={chartEleRef} />
    </div>
  );
}
