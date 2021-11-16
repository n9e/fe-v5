import React, { Component } from 'react';
import D3Graph from '@d3-charts/ts-graph';
import '@d3-charts/ts-graph/dist/index.css';
import _ from 'lodash';
import * as util from '../util';

export default class Graph extends Component {
  componentDidMount() {
    const chartOptions = {
      timestamp: 'x',
      chart: {
        height: this.props.height,
        renderTo: this.graphWrapEle,
      },
      xAxis: this.props.graphConfig.xAxis,
      yAxis: util.getYAxis({}, this.props.graphConfig),
      tooltip: {
        shared: this.props.graphConfig.shared,
        formatter: (points) => {
          return util.getTooltipsContent({
            points,
            chartWidth: this.graphWrapEle.offsetWidth - 40,
            comparison: this.props.graphConfig.comparison,
            isComparison: !!_.get(this.props.graphConfig.comparison, 'length'),
          });
        },
      },
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
        tooltip: {
          xAxis: nextProps.graphConfig.xAxis,
          shared: nextProps.graphConfig.shared,
          formatter: (points) => {
            return util.getTooltipsContent({
              points,
              chartWidth: this.graphWrapEle.offsetWidth - 40,
              comparison: nextProps.graphConfig.comparison,
              isComparison: !!_.get(nextProps.graphConfig.comparison, 'length'),
            });
          },
        },
        series: nextProps.series,
      };
      this.chart.update(chartOptions);
    }
  }

  render() {
    return (
      <div ref={(ref) => { this.graphWrapEle = ref; }} />
    );
  }
}
