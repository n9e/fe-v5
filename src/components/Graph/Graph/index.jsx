/* eslint-disable react/sort-comp */
/* eslint-disable prefer-template */
/* eslint-disable react/no-string-refs */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-expressions */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import { DragOutlined } from '@ant-design/icons'
import moment from 'moment';
import _ from 'lodash';
import { SortableHandle } from 'react-sortable-hoc';
import '@d3-charts/ts-graph/dist/index.css';
import * as config from '../config';
import * as util from '../util';
import * as api from '../api';
import Legend, { getSerieVisible, getSerieColor, getSerieIndex } from './Legend';
import GraphConfigInner from '../GraphConfig/GraphConfigInner';
import GraphChart from './Graph';

const DragHandle = SortableHandle(() => <DragOutlined style={{ cursor: 'move', color: '#999' }} />);

export default class Graph extends Component {
  static propTypes = {
    data: PropTypes.shape({ // 图表数据配置
      ...config.graphPropTypes,
      id: PropTypes.number.isRequired,
    }).isRequired,
    isDidiMonitor: PropTypes.bool,
    height: PropTypes.number, // 图表高度
    graphConfigInnerVisible: PropTypes.bool, // 内置图表配置栏是否显示
    extraRender: PropTypes.func, // 图表右侧工具栏扩展
    extraMoreList: PropTypes.node, // 图表右侧工具栏更多选项扩展
    metricMap: PropTypes.object, // 指标信息表，用于设置图表名称
    onOpenGraphConfig: PropTypes.func,
  };

  static defaultProps = {
    isDidiMonitor: false,
    // type: 'chart',
    height: 350,
    // counterListLenForAvgAggr: 2000,
    graphConfigInnerVisible: true,
    extraRender: undefined,
    extraMoreList: undefined,
    metricMap: undefined,
    // onWillInit: _.noop,
    // onDidInit: _.noop,
    // onWillUpdate: _.noop,
    // onDidUpdate: _.noop,
    onOpenGraphConfig: _.noop,
  };

  counterListCount = 0;

  constructor(props) {
    super(props);
    this.xhrs = []; // 保存 xhr 实例，用于组件销毁的时候中断进行中的请求
    this.chartOptions = config.chart;
    this.headerHeight = 35;
    this.state = {
      spinning: false,
      errorText: '', // 异常场景下的文案
      series: [],
      forceRender: false,
      showLegend: false,
      // 刷新、切换hosts时，需要按照用户已经选择的环比、聚合条件重新刷新图表，所以需要将其记录到state中
      offsets: [],
      aggrFunc: 'avg',
      aggrGroups: ['ident']
    };
    this.counterList = [];
    this.series = [];
  }

  componentDidMount() {
    this.updateAllGraphs(this.state.aggrFunc, this.state.aggrGroups, this.state.offsets)
  }

  componentDidUpdate (prevProps) {
    const oldHosts = (prevProps.data.selectedHosts || []).map(h => h.ident)
    const newHosts = (this.props.data.selectedHosts || []).map(h => h.ident)
    const isHostsChanged = !_.isEqual(oldHosts, newHosts)
    if (this.props.timeVal !== prevProps.timeVal || isHostsChanged) {
      this.updateAllGraphs(this.state.aggrFunc, this.state.aggrGroups, this.state.offsets)
    }
  }

  componentWillUnmount() {
    this.abortFetchData();
    this.chart && this.chart.destroy();
  }

  static setOptions = (options) => {
    window.OdinGraphOptions = options;
  };

  afterFetchChartDataOperations (allResponseData) {
    const rawSeries = allResponseData.reduce((acc, cur) => {
      acc.push(...cur?.data?.result)
      return acc
    }, [])
    const series = util.normalizeSeries(rawSeries);
    this.setState({ spinning: false, series });
  }

  getGraphConfig(graphConfig) {
    return {
      ...config.graphDefaultConfig,
      ...graphConfig,
      // eslint-disable-next-line no-nested-ternary
      now: graphConfig.now ? graphConfig.now : graphConfig.end ? graphConfig.end : config.graphDefaultConfig.now,
    };
  }

  getZoomedSeries() {
    return this.state.series;
  }

  generateQuery({offset, curAggrFunc, curAggrGroup}) {
    const metric = this.props.data.metric
    const idents = this.props.data.selectedHosts.map(h => h.ident)
    const offsetSubQuery = offset ? ' offset ' + offset : ''
    let query = `${metric}{ident=~"${idents.join('|')}"}${offsetSubQuery}`
    if (curAggrFunc && curAggrGroup && curAggrGroup.length > 0) {
      query = `${curAggrFunc}(${query}) by (${curAggrGroup.join(', ')})`
    }
    return query
  }

  fetchData(query) {
    this.abortFetchData();
    this.setState({ spinning: true });

    const { data, timeVal } = this.props
    const now = moment();
    try {
      return api.fetchHistory({
        start: Math.round(now.clone().subtract(timeVal, 'ms') / 1000),
        end: Math.round(now.clone().format('x') / 1000),
        step: 1,
        query
      })
    } catch (e) {
      console.log(e);
      if (e.statusText === 'abort') return;

      let errorText = e.err || e.message;

      if (e.statusText === 'error') {
        errorText = 'The network has been disconnected, please check the network';
      } else if (e.statusText === 'Not Found') {
        errorText = '404 Not Found.';
      } else if (e.responseJSON) {
        errorText = _.get(e.responseJSON, 'msg', e.responseText);

        if (!errorText || e.status === 500) {
          errorText = 'Data loading exception, please refresh and reload';
        }

        // request entity too large
        if (e.status === 413) {
          errorText = 'Request condition is too large, please reduce the condition';
        }
      }

      this.setState({ errorText, spinning: false });
      return Promise.reject();
    }
  }

  abortFetchData() {
    _.each(this.xhrs, (xhr) => {
      _.isFunction(_.get(xhr, 'abort')) && xhr.abort();
    });
    this.xhrs = [];
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
  }

  refresh = () => {
    this.updateAllGraphs(this.state.aggrFunc, this.state.aggrGroups, this.state.offsets)
  }

  resize = () => {
    if (this.chart && this.chart.resizeHandle) {
      this.chart.resizeHandle();
    }
  }

  renderChart() {
    const { errorText, series } = this.state;
    const { height, data } = this.props;
    const graphConfig = this.getGraphConfig(data);
    const chartType = _.get(data, 'chartTypeOptions.chartType') || 'line';

    if (errorText) {
      return (
        <div className="graph-errorText">
          {errorText}
        </div>
      );
    }
    if (chartType === 'line') {
      return <GraphChart graphConfig={graphConfig} height={height} series={series} />;
    }
    return null;
  }

  updateGraphConfig (args) {
    const changeObj = args[2] || {}
    const aggrFunc = changeObj?.aggrFunc
    const aggrGroups = changeObj?.aggrGroups
    const offsets = changeObj?.comparison
    if (aggrFunc) {
      this.setState({aggrFunc})
    }
    if (aggrGroups) {
      this.setState({aggrGroups})
    }
    if (offsets) {
      this.setState({offsets})
    }
    if (changeObj.legend !== undefined) {
      this.setState({
        showLegend: changeObj.legend
      })
      return
    }
    this.updateAllGraphs(aggrFunc, aggrGroups, offsets)
  }

  updateAllGraphs (aggrFunc, aggrGroups, offsets) {
    let obj = {}
    if (aggrFunc) obj.curAggrFunc = aggrFunc
    if (aggrGroups && aggrGroups.length > 0) obj.curAggrGroup = aggrGroups
    const queryNoOffset = this.generateQuery(obj)
    const noOffsetPromise = this.fetchData(queryNoOffset)
    // 如果有环比，再单独请求
    let queries = []
    if (offsets) {
      queries = offsets.map(offset => this.generateQuery({ ...obj, offset }))
    }
    const seriesPromises = queries.map(query => this.fetchData(query))
    Promise.all([ ...seriesPromises, noOffsetPromise ]).then(res => {
      this.afterFetchChartDataOperations(res)
    })
  }

  render() {
    const { spinning } = this.state;
    const { height, extraRender, data, isDidiMonitor } = this.props;
    const graphConfig = this.getGraphConfig(data);

    return (
      <div className={graphConfig.legend ? 'graph-container graph-container-hasLegend' : 'graph-container'}>
        <div
          className="graph-header"
          style={{
            height: this.headerHeight,
            lineHeight: `${this.headerHeight}px`,
            display: isDidiMonitor ? 'none' : 'block',
          }}
        >
          <div className="graph-extra">
            <div style={{ display: 'inline-block' }}>
              {
                this.props.useDragHandle ? <DragHandle /> : null
              }
              {
                _.isFunction(extraRender) ?
                  extraRender(this) : null
              }
            </div>
          </div>
          <div>{this.props.data.metric}</div>
        </div>
        {
          this.props.graphConfigInnerVisible ?
            <GraphConfigInner
              data={graphConfig}
              onChange={(...args) => {
                this.updateGraphConfig(args)
              }}
            /> : null
        }
        <Spin spinning={spinning}>
          <div style={{ height }}>
            {this.renderChart()}
          </div>
        </Spin>
        <Legend
          style={{ display: graphConfig.legend ? 'block' : 'none' }}
          graphConfig={graphConfig}
          series={this.getZoomedSeries()}
          onSelectedChange={this.handleLegendRowSelectedChange}
          comparisonOptions={graphConfig.comparisonOptions}
        />
      </div>
    );
  }
}
