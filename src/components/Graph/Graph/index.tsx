import React, { Component, ReactNode } from 'react';
import { Checkbox, Popover, Select, Spin } from 'antd';
import { SyncOutlined, SettingOutlined, ShareAltOutlined } from '@ant-design/icons';
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
import { SetTmpChartData } from '@/services/metric';

export interface GraphDataProps {
  step: number;
  range: Range;
  legend?: boolean;
  title?: string;
  selectedHosts?: { ident: string }[];
  metric?: string;
  promqls?: string[];
  ref?: any;
}

interface GraphProps {
  height?: number;
  ref?: any;
  data: GraphDataProps;
  graphConfigInnerVisible?: boolean;
  extraRender?: (ReactNode) => ReactNode;
  isShowShare?: boolean;
  defaultAggrFunc?: string;
  defaultAggrGroups?: string[];
  defaultOffsets?: string[];
}

interface GraphState {
  spinning: boolean;
  errorText: string;
  series: any[];
  forceRender: boolean;
  offsets: string[];
  aggrFunc: string;
  aggrGroups: string[];
  legend: boolean;
  highLevelConfig: {
    shared: boolean,
    sharedSortDirection: 'desc' | 'asc',
    precision: 'short' | 'origin' | number,
    formatUnit: 1024 | 1000
  }
}

const { Option } = Select;
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
      // 刷新、切换hosts时，需要按照用户已经选择的环比、聚合条件重新刷新图表，所以需要将其记录到state中
      offsets: this.props.defaultOffsets || [],
      aggrFunc: this.props.defaultAggrFunc || 'avg',
      aggrGroups: this.props.defaultAggrGroups || ['ident'],
      legend: true,
      highLevelConfig: {
        shared: true,
        sharedSortDirection: 'desc',
        precision: 'short',
        formatUnit: 1024
      }
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
      ...this.state.highLevelConfig,
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

  shareChart = () => {
    let serielData = {
      dataProps: { ...this.props.data },
      state: {
        defaultAggrFunc: this.state.aggrFunc,
        defaultAggrGroups: this.state.aggrGroups,
        defaultOffsets: this.state.offsets
      }
    }
    delete serielData.dataProps.ref
    SetTmpChartData([
      {
        configs: JSON.stringify(serielData)
      }
    ]).then(res => {
      const ids = res.dat
      window.open('/chart/' + ids)
    })
  }

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

  updateGraphConfig (changeObj) {
    const aggrFunc = changeObj?.aggrFunc
    const aggrGroups = changeObj?.aggrGroups
    const offsets = changeObj?.comparison
    this.setState({aggrFunc, aggrGroups, offsets})
    this.updateAllGraphs(aggrFunc, aggrGroups, offsets);
  }

  updateAllGraphs(aggrFunc, aggrGroups, offsets) {
    const { promqls } = this.props.data;
    let obj: { curAggrFunc?: string; curAggrGroup?: string[]; offset?: string[] } = {};
    if (aggrFunc) obj.curAggrFunc = aggrFunc;
    if (aggrGroups && aggrGroups.length > 0) obj.curAggrGroup = aggrGroups;
    if (promqls) {
      const noOffsetPromise = promqls.map((query) => this.fetchData(query));
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


  getContent () {
    return (
      <div>
        <Checkbox
          checked={this.state.highLevelConfig.shared}
          onChange={(e) => {
            this.setState({
              highLevelConfig: {
                ...this.state.highLevelConfig,
                shared: e.target.checked
              }
            })
          }}
        >Multi Series in Tooltip, order value</Checkbox>
        <Select value={this.state.highLevelConfig.sharedSortDirection} onChange={(v: 'desc' | 'asc') => {
          this.setState({
            highLevelConfig: {
              ...this.state.highLevelConfig,
              sharedSortDirection: v
            }
          })
        }}>
          <Option value='desc'>desc</Option>
          <Option value='asc'>asc</Option>
        </Select>
        <br />
        <Checkbox
          checked={this.state.legend}
          onChange={(e) => {
            this.setState({
              legend: e.target.checked
            })
          }}
        >Show Legend</Checkbox>
        <br />
        <Checkbox
          checked={this.state.highLevelConfig.precision === 'short'}
          onChange={(e) => {
            this.setState({
              highLevelConfig: {
                ...this.state.highLevelConfig,
                precision: e.target.checked ? 'short' : 'origin'
              }
            })
          }}>Value format with: Ki, Mi, Gi by</Checkbox>
        <Select value={this.state.highLevelConfig.formatUnit} onChange={(v: 1024 | 1000) => {
          this.setState({
            highLevelConfig: {
              ...this.state.highLevelConfig,
              formatUnit: v
            }
          })
        }}>
          <Option value={1024}>1024</Option>
          <Option value={1000}>1000</Option>
        </Select>
      </div>
    );
  }

  render() {
    const { spinning } = this.state;
    const { extraRender, data } = this.props;
    const { title, metric } = data;
    const graphConfig = this.getGraphConfig(data);

    return (
      <div className={this.state.legend ? 'graph-container graph-container-hasLegend' : 'graph-container'}>
        <div
          className='graph-header'
          style={{
            height: this.headerHeight,
            lineHeight: `${this.headerHeight}px`,
          }}
        >
          <div className='graph-extra'>
            <span className="graph-operationbar-item" key="info">
              <Popover placement="left" content={this.getContent()} trigger="click">
                <SettingOutlined />
              </Popover>
            </span>
            <span className="graph-operationbar-item" key="sync">
              <SyncOutlined onClick={this.refresh} />
            </span>
            {this.props.isShowShare === false ? null :
            <span className="graph-operationbar-item" key="share">
              <ShareAltOutlined onClick={this.shareChart} />
            </span>
            }
            {extraRender && _.isFunction(extraRender) ? extraRender(this) : null}
          </div>
          <div>{title || metric}</div>
        </div>
        {this.props.graphConfigInnerVisible ? (
          <GraphConfigInner
            data={graphConfig}
            onChange={(...args) => {
              this.updateGraphConfig(args[2] || {});
            }}
          />
        ) : null}
        {/* 这个spin有点难搞，因为要第一时间获取chart容器的offsetheight */}
        {/* <Spin spinning={spinning} wrapperClassName='graph-spin'> */}
        {this.renderChart()}
        {/* </Spin> */}
        <Legend
          style={{ display: this.state.legend ? 'block' : 'none', overflowY: 'auto', maxHeight: '35%' }}
          graphConfig={graphConfig}
          series={this.getZoomedSeries()}
          onSelectedChange={this.handleLegendRowSelectedChange}
          comparisonOptions={graphConfig.comparisonOptions}
        />
      </div>
    );
  }
}
