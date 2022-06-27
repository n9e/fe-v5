/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { Component, ReactNode } from 'react';
import { Button, Checkbox, Dropdown, Menu, Popover, Select, Spin } from 'antd';
import { DownOutlined, SyncOutlined, SettingOutlined, ShareAltOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import '@d3-charts/ts-graph/dist/index.css';
import * as config from '../config';
import * as util from '../util';
import * as api from '../api';
import Legend, { getSerieVisible, getSerieColor, getSerieIndex, isEqualSeries } from './Legend';
import GraphConfigInner from '../GraphConfig/GraphConfigInner';
import GraphChart from './Graph';
import { Range, formatPickerDate } from '@/components/DateRangePicker';
import { SetTmpChartData } from '@/services/metric';
import { ChartType } from '@/components/D3Charts/src/interface';
import { QueryStats } from '@/pages/metric/explorer/QueryStatsView';

export interface GraphDataProps {
  step: number | null;
  range: Range;
  legend?: boolean;
  title?: string | ReactNode;
  selectedHosts?: { ident: string }[];
  metric?: string;
  promqls?: string[] | { current: string }[];
  legendTitleFormats?: string[];
  ref?: any;
  yAxis?: any;
  chartType?: ChartType;
}

export interface ErrorInfoType {
  status: string;
  error: string;
  errorType: string;
}

export interface HighLevelConfigType {
  shared?: boolean;
  sharedSortDirection?: 'desc' | 'asc';
  precision?: 'short' | 'origin' | number;
  formatUnit?: 1024 | 1000 | 'humantime';
}

interface GraphProps {
  height?: number;
  ref?: any;
  data: GraphDataProps;
  graphConfigInnerVisible?: boolean;
  showHeader?: boolean;
  extraRender?: (ReactNode) => ReactNode;
  isShowRefresh?: boolean;
  isShowShare?: boolean;
  defaultAggrFunc?: string;
  defaultAggrGroups?: string[];
  defaultOffsets?: string[];
  highLevelConfig?: Partial<HighLevelConfigType>;
  onErrorOccured?: (errorArr: ErrorInfoType[]) => void;
  onRequestCompleted?: (requestInfo: QueryStats) => void;
}

interface GraphState {
  spinning: boolean;
  errorText: string;
  series: any[];
  chartShowSeries: any[];
  legendHighlightedKeys: number[];
  offsets: string[];
  aggrFunc: string;
  aggrGroups: string[];
  calcFunc: string;
  legend: boolean;
  highLevelConfig: {
    shared: boolean;
    sharedSortDirection: 'desc' | 'asc';
    precision: 'short' | 'origin' | number;
    formatUnit: 1024 | 1000 | 'humantime';
  };
  onErrorOccured?: (errorArr: ErrorInfoType[]) => void;
  onRequestCompleted?: (requestInfo: QueryStats) => void;
}

const formatUnitInfoMap = {
  1024: 'Ki, Mi, Gi by 1024',
  1000: 'Ki, Mi, Gi by 1000',
  humantime: 'Human time duration',
};

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
      chartShowSeries: [],
      legendHighlightedKeys: [],
      // 刷新、切换hosts时，需要按照用户已经选择的环比、聚合条件重新刷新图表，所以需要将其记录到state中
      offsets: this.props.defaultOffsets || [],
      aggrFunc: this.props.defaultAggrFunc || 'avg',
      aggrGroups: this.props.defaultAggrGroups || ['ident'],
      calcFunc: '',
      legend: props.data.legend !== undefined ? props.data.legend : true,
      highLevelConfig: {
        shared: this.props.highLevelConfig?.shared === undefined ? true : this.props.highLevelConfig?.shared,
        sharedSortDirection: this.props.highLevelConfig?.sharedSortDirection || 'desc',
        precision: this.props.highLevelConfig?.precision || 'short',
        formatUnit: this.props.highLevelConfig?.formatUnit || 1000,
      },
      onErrorOccured: this.props.onErrorOccured,
      onRequestCompleted: this.props.onRequestCompleted,
    };
  }

  componentDidMount() {
    this.updateAllGraphs(this.state.aggrFunc, this.state.aggrGroups, this.state.offsets, this.state.calcFunc);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data.legend !== undefined && this.props.data.legend !== nextProps.data.legend) {
      this.setState({ legend: nextProps.data.legend });
    }
    // 兼容及时查询页面操作图标属性
    // 接受外部format，legend，multi等属性并更新视图
    if (typeof nextProps.highLevelConfig === 'object') {
      let showUpdate = false;
      const updateObj = Object.assign({}, this.state.highLevelConfig);
      for (let key of Object.keys(updateObj)) {
        if (updateObj[key] !== nextProps.highLevelConfig[key]) {
          updateObj[key] = nextProps.highLevelConfig[key];
          showUpdate = true;
        }
      }
      if (showUpdate) {
        this.setState({
          highLevelConfig: updateObj,
        });
      }
    }
  }

  componentDidUpdate(prevProps) {
    const oldHosts = (prevProps.data.selectedHosts || []).map((h) => h.ident);
    const newHosts = (this.props.data.selectedHosts || []).map((h) => h.ident);
    const isHostsChanged = !_.isEqual(oldHosts, newHosts);
    if (isHostsChanged || !_.isEqualWith(prevProps.data, this.props.data)) {
      this.updateAllGraphs(this.state.aggrFunc, this.state.aggrGroups, this.state.offsets, this.state.calcFunc);
    }
  }

  componentWillUnmount() {
    this.chart && this.chart.destroy();
  }

  afterFetchChartDataOperations(allResponseData, queryStart, step) {
    const errorSeries: ErrorInfoType[] = [];
    const { offsets, series: previousSeries, legendHighlightedKeys } = this.state;
    const { legendTitleFormats } = this.props.data;
    const rawSeries = allResponseData.reduce((acc, cur, idx) => {
      if (cur.status === 'error') {
        errorSeries.push(cur);
        return acc;
      }
      const arr = cur?.data?.result;
      // 添加环比信息
      if (offsets) {
        arr.forEach((item) => {
          item.offset = offsets[idx] || '';
          item.legendTitleFormat = legendTitleFormats && legendTitleFormats[idx];
        });
      }
      acc.push(...arr);
      return acc;
    }, []);
    const series = util.normalizeSeries(rawSeries);
    const isEqualSeriesResult = isEqualSeries(previousSeries, series);
    this.setState(Object.assign({ spinning: false, series, chartShowSeries: series, legendHighlightedKeys: isEqualSeriesResult ? legendHighlightedKeys : [] }));
    // 如果数据源相同，同步图表展示内容
    if (isEqualSeriesResult) {
      this.handleLegendRowSelectedChange('normal', this.state.legendHighlightedKeys);
    }

    // 回显错误信息和请求结果信息，即时查询页需要
    this.state.onErrorOccured && this.state.onErrorOccured(errorSeries);
    !errorSeries.length &&
      this.state.onRequestCompleted &&
      this.state.onRequestCompleted({
        loadTime: Date.now() - queryStart,
        resolution: step,
        resultSeries: series.length,
      });
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
    const { offset, curAggrFunc, curAggrGroup, calcFunc = '' } = obj;
    const [calcMethod, calcPeriod] = calcFunc.split('_');
    const { metric, selectedHosts } = this.props.data;
    if (metric && selectedHosts) {
      const idents = selectedHosts.map((h) => h.ident);
      const offsetSubQuery = offset ? ' offset ' + offset : '';
      let query = `${calcFunc ? calcMethod + '(' : ''}${metric}{ident=~"${idents.join('|')}"}${calcFunc ? '[' + calcPeriod + ']' : ''}${offsetSubQuery}${calcFunc ? ')' : ''}`;
      if (curAggrFunc && curAggrGroup && curAggrGroup.length > 0) {
        query = `${curAggrFunc}(${query}) by (${curAggrGroup.join(', ')})`;
      }
      return query;
    }
  }

  fetchData(query, { start, end, step }) {
    this.setState({ spinning: true });
    try {
      return api.fetchHistory({
        start: start - (start % step),
        end: end - (end % step),
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
    const curChartType = this.props.data.chartType;
    const newChartShowSeries: any[] = [];
    // 图表类型为堆叠图并且选中部分图表时，过滤展示的 series
    if (curChartType === ChartType.StackArea && highlightedKeys.length) {
      highlightedKeys.forEach((i: number) => newChartShowSeries.push(series[i]));
    }

    const newSeries = _.map(series, (serie, i) => {
      const oldColor = _.get(serie, 'oldColor', serie.color);
      return {
        ...serie,
        visible: getSerieVisible(serie, selectedKeys),
        zIndex: getSerieIndex(serie, highlightedKeys, series.length, i),
        color: curChartType === ChartType.StackArea ? oldColor : getSerieColor(serie, highlightedKeys, oldColor),
        oldColor,
      };
    });
    this.setState({ series: newSeries, chartShowSeries: newChartShowSeries.length ? newChartShowSeries : newSeries, legendHighlightedKeys: highlightedKeys });
  };

  refresh = () => {
    this.updateAllGraphs(this.state.aggrFunc, this.state.aggrGroups, this.state.offsets, this.state.calcFunc);
  };

  shareChart = () => {
    const initShareDataProps = { ...this.props.data, legend: this.state.legend };
    if (!initShareDataProps.promqls) {
      let queries: string[] = [];
      const obj = {
        curAggrFunc: this.state.aggrFunc,
        curAggrGroup: this.state.aggrGroups,
      };
      const baseQuery = this.generateQuery(obj);
      baseQuery && queries.push(baseQuery);
      const offsetQuery = this.state.offsets.map((offset) => this.generateQuery({ ...obj, offset })).filter((query) => query);
      queries = queries.concat(offsetQuery as string[]);
      initShareDataProps.promqls = queries;
    }
    let serielData = {
      dataProps: initShareDataProps,
      highLevelConfig: { ...this.state.highLevelConfig },
      curCluster: localStorage.getItem('curCluster'),
    };
    delete serielData.dataProps.ref;

    SetTmpChartData([
      {
        configs: JSON.stringify(serielData),
      },
    ]).then((res) => {
      const ids = res.dat;
      window.open('/chart/' + ids);
    });
  };

  resize = () => {
    if (this.chart && this.chart.resizeHandle) {
      this.chart.resizeHandle();
    }
  };

  renderChart() {
    const { errorText, chartShowSeries } = this.state;
    const { height, data } = this.props;
    const graphConfig = this.getGraphConfig(data);

    if (errorText) {
      return <div className='graph-errorText'>{errorText}</div>;
    }
    return <GraphChart graphConfig={graphConfig} series={chartShowSeries} style={{ minHeight: '65%' }} />;
  }

  updateGraphConfig(changeObj) {
    const { aggrFunc, aggrGroups, comparison: offsets, calcFunc } = changeObj;
    this.setState({ aggrFunc, aggrGroups, offsets, calcFunc });
    if (changeObj.changeType === 'aggrFuncChange' && aggrGroups.length === 0) return;
    this.updateAllGraphs(aggrFunc, aggrGroups, offsets, calcFunc);
  }

  updateAllGraphs(aggrFunc, aggrGroups, offsets, calcFunc) {
    const queryStart = Date.now();
    let { promqls, range, step } = this.props.data;
    const { start, end } = formatPickerDate(range);
    // 如果没有 step(resolution)，计算一个默认的 step 值
    if (!step) step = Math.max(Math.floor((end - start) / 240), 1);

    let obj: { curAggrFunc?: string; curAggrGroup?: string[]; offset?: string[]; calcFunc: string } = { calcFunc };
    if (aggrFunc) obj.curAggrFunc = aggrFunc;
    if (aggrGroups && aggrGroups.length > 0) obj.curAggrGroup = aggrGroups;

    if (promqls) {
      // 取查询语句的正确值，并去掉查询条件为空的语句
      const formattedPromqls = promqls
        .map((promql: string | { current: string }) => {
          return typeof promql === 'string' ? promql : promql.current;
        })
        .filter((promql) => promql);

      if (formattedPromqls.length) {
        const noOffsetPromise = formattedPromqls.map((query) => this.fetchData(query, { start, end, step }));
        Promise.all([...noOffsetPromise]).then((res) => {
          this.afterFetchChartDataOperations(res, queryStart, step);
        });
      }
    } else {
      const queryNoOffset = this.generateQuery(obj);
      // 如果有环比，再单独请求
      let queries = [];
      if (offsets) {
        queries = offsets.map((offset) => this.generateQuery({ ...obj, offset }));
      }
      const seriesPromises = queries.map((query) => this.fetchData(query, { start, end, step }));
      const noOffsetPromise = this.fetchData(queryNoOffset, { start, end, step });
      Promise.all([...seriesPromises, noOffsetPromise]).then((res) => {
        this.afterFetchChartDataOperations(res, queryStart, step);
      });
    }
  }

  getContent() {
    const aggrFuncMenu = (
      <Menu
        onClick={(sort) => {
          this.setState({
            highLevelConfig: {
              ...this.state.highLevelConfig,
              sharedSortDirection: (sort as { key: 'desc' | 'asc' }).key,
            },
          });
        }}
        selectedKeys={[this.state.highLevelConfig.sharedSortDirection]}
      >
        <Menu.Item key='desc'>desc</Menu.Item>
        <Menu.Item key='asc'>asc</Menu.Item>
      </Menu>
    );
    const precisionMenu = (
      <Menu
        onClick={(precision) => {
          const precisionKey = isNaN(Number(precision.key)) ? precision.key : Number(precision.key);
          this.setState({
            highLevelConfig: {
              ...this.state.highLevelConfig,
              formatUnit: precisionKey as 1024 | 1000 | 'humantime',
            },
          });
        }}
        selectedKeys={[String(this.state.highLevelConfig.formatUnit)]}
      >
        <Menu.Item key={'1000'}>Ki, Mi, Gi by 1000</Menu.Item>
        <Menu.Item key={'1024'}>Ki, Mi, Gi by 1024</Menu.Item>
        <Menu.Item key={'humantime'}>Human time duration</Menu.Item>
      </Menu>
    );
    return (
      <div>
        <Checkbox
          checked={this.state.highLevelConfig.shared}
          onChange={(e) => {
            this.setState({
              highLevelConfig: {
                ...this.state.highLevelConfig,
                shared: e.target.checked,
              },
            });
          }}
        >
          Multi Series in Tooltip, order value
        </Checkbox>
        <Dropdown overlay={aggrFuncMenu}>
          <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
            {this.state.highLevelConfig.sharedSortDirection} <DownOutlined />
          </a>
        </Dropdown>
        <br />
        <Checkbox
          checked={this.state.legend}
          onChange={(e) => {
            this.setState({
              legend: e.target.checked,
            });
          }}
        >
          Show Legend
        </Checkbox>
        <br />
        <Checkbox
          checked={this.state.highLevelConfig.precision === 'short'}
          onChange={(e) => {
            this.setState({
              highLevelConfig: {
                ...this.state.highLevelConfig,
                precision: e.target.checked ? 'short' : 'origin',
              },
            });
          }}
        >
          Value format with:{' '}
        </Checkbox>
        <Dropdown overlay={precisionMenu}>
          <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
            {formatUnitInfoMap[this.state.highLevelConfig.formatUnit]} <DownOutlined />
          </a>
        </Dropdown>
      </div>
    );
  }

  render() {
    const { spinning } = this.state;
    const { extraRender, data, showHeader = true } = this.props;
    const { title, metric } = data;
    const graphConfig = this.getGraphConfig(data);
    return (
      <div className={this.state.legend ? 'graph-container graph-container-hasLegend' : 'graph-container'}>
        {showHeader && (
          <div
            className='graph-header'
            style={{
              height: this.headerHeight,
              lineHeight: `${this.headerHeight}px`,
            }}
          >
            <div>{title || metric}</div>
            <div className='graph-extra'>
              <span className='graph-operationbar-item' key='info'>
                <Popover placement='left' content={this.getContent()} trigger='click' autoAdjustOverflow={false} getPopupContainer={() => document.body}>
                  <Button className='' type='link' size='small' onClick={(e) => e.preventDefault()}>
                    <SettingOutlined />
                  </Button>
                </Popover>
              </span>
              {this.props.isShowRefresh === false ? null : (
                <span className='graph-operationbar-item' key='sync'>
                  <Button type='link' size='small' onClick={(e) => e.preventDefault()}>
                    <SyncOutlined onClick={this.refresh} />
                  </Button>
                </span>
              )}
              {this.props.isShowShare === false ? null : (
                <span className='graph-operationbar-item' key='share'>
                  <Button type='link' size='small' onClick={(e) => e.preventDefault()}>
                    <ShareAltOutlined onClick={this.shareChart} />
                  </Button>
                </span>
              )}
              {extraRender && _.isFunction(extraRender) ? extraRender(this) : null}
            </div>
          </div>
        )}
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
