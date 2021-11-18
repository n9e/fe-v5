import React, { Component, Ref } from 'react';
import D3Graph from '@d3-charts/ts-graph';
import '@d3-charts/ts-graph/dist/index.css';
import _ from 'lodash';
import * as util from '../util';
import { AnyARecord } from 'dns';
import './index.less';

interface GraphProps {
  height?: number;
  style?: object;
  graphConfig: {
    xAxis: number;
    shared: any;
    comparison: any;
    sharedSortDirection: string;
    precision: string;
  };
  series: object[];
}

export default class Graph extends Component<GraphProps> {
  private graphWrapEle: any;
  private chart: D3Graph;
  componentDidMount() {
    const chartOptions = {
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
    console.log('componentWillReceiveProps yaxis', this.chart.options.yAxis, util.getYAxis(this.chart.options.yAxis, nextProps.graphConfig))
    if (this.chart) {
      const chartOptions = {
        yAxis: util.getYAxis(this.chart.options.yAxis, nextProps.graphConfig),
        tooltip: this.genChartTooltipOptions(nextProps),
        series: nextProps.series,
      };
      this.chart.update(chartOptions);
    }
  }

  genChartTooltipOptions (nextProps) {
    const isFormatUnit1024 = nextProps.graphConfig.formatUnit === 1024 && nextProps.graphConfig.precision === 'short'
    return isFormatUnit1024 ? {
      xAxis: nextProps.graphConfig.xAxis,
      shared: nextProps.graphConfig.shared,
      sharedSortDirection: nextProps.graphConfig.sharedSortDirection,
      formatter: (points) => {
        return util.getTooltipsContent({
          formatUnit: nextProps.graphConfig.formatUnit,
          precision: nextProps.graphConfig.precision,
          series: this.props.series,
          points,
          chartWidth: this.graphWrapEle.offsetWidth - 40
        });
      },
    } : {
      xAxis: nextProps.graphConfig.xAxis,
      shared: nextProps.graphConfig.shared,
      sharedSortDirection: nextProps.graphConfig.sharedSortDirection,
      precision: nextProps.graphConfig.precision,
    }
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
