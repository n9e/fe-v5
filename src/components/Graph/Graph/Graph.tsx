// @ts-nocheck
// TODO: 类型校验补充

import React, { Component, Ref } from 'react';
import D3Graph from '@/components/D3Charts/src/index';
import '@d3-charts/ts-graph/dist/index.css';
import _ from 'lodash';
import * as util from '../util';
import { AnyARecord } from 'dns';
import './index.less';
import { ChartType } from '@/components/D3Charts/src/interface';

interface GraphProps {
  height?: number;
  style?: object;
  graphConfig: {
    xAxis: number;
    shared: any;
    comparison: any;
    sharedSortDirection: string;
    precision: string;
    chartType?: ChartType;
  };
  series: object[];
}

export default class Graph extends Component<GraphProps> {
  private graphWrapEle: any;
  private chart: D3Graph;
  componentDidMount() {
    const chartOptions = {
      chartType: this.props.graphConfig.chartType || ChartType.Line,
      timestamp: 'x',
      chart: {
        height: this.props.height ? this.props.height : undefined,
        renderTo: this.graphWrapEle,
      },
      xAxis: this.props.graphConfig.xAxis,
      yAxis: util.getYAxis({}, this.props.graphConfig),
      tooltip: this.genChartTooltipOptions(this.props),
      series: this.props.series,
      legend: {
        enabled: false,
      },
      // onZoom: (getZoomedSeries) => {
      //   this.getZoomedSeries = getZoomedSeries;
      //   this.forceUpdate();
      // },
    };
    this.chart = new D3Graph(chartOptions);
  }

  componentWillReceiveProps(nextProps) {
    if (this.chart) {
      const chartOptions = {
        yAxis: util.getYAxis(this.chart.options.yAxis, nextProps.graphConfig),
        tooltip: this.genChartTooltipOptions(nextProps),
        series: nextProps.series,
        chartType: nextProps.graphConfig.chartType || ChartType.Line,
      };
      this.chart.update(chartOptions);
    }
  }

  genChartTooltipOptions(nextProps) {
    const isFormatUnit1024 = nextProps.graphConfig.formatUnit === 1024 && nextProps.graphConfig.precision === 'short';
    let options = {
      xAxis: nextProps.graphConfig.xAxis,
      shared: nextProps.graphConfig.shared,
      sharedSortDirection: nextProps.graphConfig.sharedSortDirection,
      formatter: (points) => {
        return util.getTooltipsContent({
          formatUnit: nextProps.graphConfig.formatUnit,
          precision: nextProps.graphConfig.precision,
          series: this.props.series,
          points,
          chartWidth: this.graphWrapEle.offsetWidth - 40,
          chartType: nextProps.graphConfig.chartType,
        });
      },
    };
    if (isFormatUnit1024) {
      Object.assign(options, {
        precision: nextProps.graphConfig.precision,
      });
    }
    return options;
  }

  render() {
    return (
      <div
        style={{ ...this.props.style }}
        ref={(ref) => {
          this.graphWrapEle = ref;
        }}
        className='chart-content'
      />
    );
  }
}
