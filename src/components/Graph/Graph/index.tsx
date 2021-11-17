import React, { Component, ReactNode } from 'react';
import { Spin } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import '@d3-charts/ts-graph/dist/index.css';
import * as config from '../config';
import * as util from '../util';
import * as api from '../api';
import Legend, { getSerieVisible, getSerieColor, getSerieIndex } from './Legend';
import GraphConfigInner from '../GraphConfig/GraphConfigInner';
import GraphChart from './Graph';
import { Range, formatPickerDate } from '@/components/DateRangePicker';

interface GraphProps {
  height?: number;
  ref?: any;
  data: {
    step: number;
    range: Range;
    legend?: boolean;
    title?: string;
    selectedHosts?: { ident: string }[];
    metric?: string;
    promqls?: string[] | { current: string }[];
  };
  graphConfigInnerVisible?: boolean;
  showHeader?: boolean;
  extraRender?: (ReactNode) => ReactNode;
}

interface GraphState {
  spinning: boolean;
  errorText: string;
  series: any[];
  forceRender: boolean;
  showLegend: boolean;
  offsets: string[];
  aggrFunc: string;
  aggrGroups: string[];
}

export default class Graph extends Component<GraphProps, GraphState> {
  private readonly headerHeight: number = 35;
  private readonly chart: any;

  constructor(props: GraphProps) {
    super(props);
    this.state = {
      spinning: false,
      errorText: '', // 异常场景下的文案
      series: [],
      forceRender: false,
      showLegend: false,
      // 刷新、切换hosts时，需要按照用户已经选择的环比、聚合条件重新刷新图表，所以需要将其记录到state中
      offsets: [],
      aggrFunc: 'avg',
      aggrGroups: ['ident'],
    };
  }

  componentDidMount() {
    this.updateAllGraphs(this.state.aggrFunc, this.state.aggrGroups, this.state.offsets);
  }

  componentDidUpdate(prevProps) {
    const oldHosts = (prevProps.data.selectedHosts || []).map((h) => h.ident);
    const newHosts = (this.props.data.selectedHosts || []).map((h) => h.ident);
    const isHostsChanged = !_.isEqual(oldHosts, newHosts);
    if (isHostsChanged || prevProps.data !== this.props.data) {
      this.updateAllGraphs(this.state.aggrFunc, this.state.aggrGroups, this.state.offsets);
    }
  }

  componentWillUnmount() {
    this.chart && this.chart.destroy();
  }

  afterFetchChartDataOperations(allResponseData) {
    const offsets = this.state.offsets
    const rawSeries = allResponseData.reduce((acc, cur, idx) => {
      const arr = cur?.data?.result
      // 添加环比信息
      if (offsets) {
        arr.forEach(item => {
          item.offset = offsets[idx] || ''
        })
      }
      acc.push(...arr);
      return acc;
    }, []);
    const series = util.normalizeSeries(rawSeries);
    this.setState({ spinning: false, series });
  }

  getGraphConfig(graphConfig) {
    return {
      ...config.graphDefaultConfig,
      ...graphConfig,
      now: graphConfig.now ? graphConfig.now : graphConfig.end ? graphConfig.end : config.graphDefaultConfig.now,
    };
  }

  getZoomedSeries() {
    return this.state.series;
  }

  generateQuery(obj) {
    const { offset, curAggrFunc, curAggrGroup } = obj;
    const { metric, selectedHosts } = this.props.data;
    if (metric && selectedHosts) {
      const idents = selectedHosts.map((h) => h.ident);
      const offsetSubQuery = offset ? ' offset ' + offset : '';
      let query = `${metric}{ident=~"${idents.join('|')}"}${offsetSubQuery}`;
      if (curAggrFunc && curAggrGroup && curAggrGroup.length > 0) {
        query = `${curAggrFunc}(${query}) by (${curAggrGroup.join(', ')})`;
      }
      return query;
    }
  }

  fetchData(query) {
    this.setState({ spinning: true });

    const {
      data: { range, step },
    } = this.props;
    const { start, end } = formatPickerDate(range);
    try {
      return api.fetchHistory({
        start,
        end,
        step,
        query,
      });
    } catch (e) {
      this.setState({ spinning: false });
      return Promise.reject();
    }
  }

  handleLegendRowSelectedChange = (selectedKeys, highlightedKeys) => {
    const { series } = this.state;

    const newSeries = _.map(series, (serie, i) => {
      const oldColor = _.get(serie, 'oldColor', serie.color);
      return {
        ...serie,
        visible: getSerieVisible(serie, selectedKeys),
        zIndex: getSerieIndex(serie, highlightedKeys, series.length, i),
        color: getSerieColor(serie, highlightedKeys, oldColor),
        oldColor,
      };
    });

    this.setState({ series: newSeries });
  };

  refresh = () => {
    this.updateAllGraphs(this.state.aggrFunc, this.state.aggrGroups, this.state.offsets);
  };

  resize = () => {
    if (this.chart && this.chart.resizeHandle) {
      this.chart.resizeHandle();
    }
  };

  renderChart() {
    const { errorText, series } = this.state;
    const { height, data } = this.props;
    const graphConfig = this.getGraphConfig(data);
    const chartType = _.get(data, 'chartTypeOptions.chartType') || 'line';

    if (errorText) {
      return <div className='graph-errorText'>{errorText}</div>;
    }
    if (chartType === 'line') {
      return <GraphChart graphConfig={graphConfig} series={series} style={{ minHeight: '65%' }} />;
      // return <GraphChart graphConfig={graphConfig} height={height} series={series} />;
    }
    return null;
  }

  updateGraphConfig (args) {
    const changeObj = args[2] || {}
    const aggrFunc = changeObj?.aggrFunc
    const aggrGroups = changeObj?.aggrGroups
    const offsets = changeObj?.comparison
    this.setState({aggrFunc, aggrGroups, offsets})
    if (changeObj.legend !== undefined) {
      this.setState({
        showLegend: changeObj.legend,
      });
      return;
    }
    this.updateAllGraphs(aggrFunc, aggrGroups, offsets);
  }

  updateAllGraphs(aggrFunc, aggrGroups, offsets) {
    const { promqls } = this.props.data;
    let obj: { curAggrFunc?: string; curAggrGroup?: string[]; offset?: string[] } = {};
    if (aggrFunc) obj.curAggrFunc = aggrFunc;
    if (aggrGroups && aggrGroups.length > 0) obj.curAggrGroup = aggrGroups;
    if (promqls) {
      // 取查询语句的正确值，并去掉查询条件为空的语句
      const formattedPromqls = promqls
        .map((promql: string | { current: string }) => {
          return typeof promql === 'string' ? promql : promql.current;
        })
        .filter((promql) => promql);

      const noOffsetPromise = formattedPromqls.map((query) => this.fetchData(query));
      Promise.all([...noOffsetPromise]).then((res) => {
        this.afterFetchChartDataOperations(res);
      });
    } else {
      const queryNoOffset = this.generateQuery(obj);
      // 如果有环比，再单独请求
      let queries = [];
      if (offsets) {
        queries = offsets.map((offset) => this.generateQuery({ ...obj, offset }));
      }
      const seriesPromises = queries.map((query) => this.fetchData(query));
      const noOffsetPromise = this.fetchData(queryNoOffset);
      Promise.all([...seriesPromises, noOffsetPromise]).then((res) => {
        this.afterFetchChartDataOperations(res);
      });
    }
  }

  render() {
    const { spinning } = this.state;
    const { extraRender, data, showHeader = true } = this.props;
    const { title, metric } = data;
    const graphConfig = this.getGraphConfig(data);

    return (
      <div className={graphConfig.legend ? 'graph-container graph-container-hasLegend' : 'graph-container'}>
        {showHeader && (
          <div
            className='graph-header'
            style={{
              height: this.headerHeight,
              lineHeight: `${this.headerHeight}px`,
            }}
          >
            <div className='graph-extra'>
              <div style={{ display: 'inline-block' }}>{extraRender && _.isFunction(extraRender) ? extraRender(this) : null}</div>
            </div>
            <div>{title || metric}</div>
          </div>
        )}
        {this.props.graphConfigInnerVisible ? (
          <GraphConfigInner
            data={graphConfig}
            onChange={(...args) => {
              this.updateGraphConfig(args);
            }}
          />
        ) : null}
        {/* 这个spin有点难搞，因为要第一时间获取chart容器的offsetheight */}
        {/* <Spin spinning={spinning} wrapperClassName='graph-spin'> */}
        {this.renderChart()}
        {/* </Spin> */}
        <Legend
          style={{ display: graphConfig.legend ? 'block' : 'none', overflowY: 'auto', maxHeight: '35%' }}
          graphConfig={graphConfig}
          series={this.getZoomedSeries()}
          onSelectedChange={this.handleLegendRowSelectedChange}
          comparisonOptions={graphConfig.comparisonOptions}
        />
      </div>
    );
  }
}
