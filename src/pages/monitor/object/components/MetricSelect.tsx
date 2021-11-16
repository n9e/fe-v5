import React, { useEffect, useState } from 'react'
import { Button, Input, Tabs, Tooltip } from 'antd';
import { metricMap, metricsMeta } from '../config';
import { filterMetrics, matchMetrics } from '../utils';
import _ from 'lodash'

const { TabPane } = Tabs
const { Search } = Input
function getCurrentMetricMeta(metric: string) {
  if (metricsMeta[metric]) {
    return metricsMeta[metric];
  }
  let currentMetricMeta;
  _.each(metricsMeta, (val, key) => {
    if (key.indexOf('$Name') > -1) {
      const keySplit = key.split('$Name');
      if (metric.indexOf(keySplit[0]) === 0 && metric.indexOf(keySplit[1]) > 0) {
        currentMetricMeta = val;
      }
    }
  });
  return currentMetricMeta;
}
export default (props) => {
  const { metrics, handleMetricClick } = props
  const [selectedHostsKeys, setSelectedHostsKeys] = useState<string[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [activeKey, setActiveKey] = useState<string>('ALL')
  const [metricTipVisible, setMetricTipVisible] = useState({})
  const handleMetricTabsChange = (key: string) => {
    setActiveKey(key)
  }
  function getSelectedMetricsLen(metric: string, selectedMetrics: string) {
    const filtered = _.filter(selectedMetrics, o => o === metric);
    if (filtered.length) {
      return <span style={{ color: '#999' }}> +{filtered.length}</span>;
    }
    return null;
  }
  const normalizMetrics = (key: string) => {
    let newMetrics = _.cloneDeep(metrics);
    if (key !== 'ALL') {
      const { filter, data } = metricMap[key];
      if (filter && filter.type && filter.value) {
        return filterMetrics(filter.type, filter.value, metrics);
      } else if (data && data.length !== 0) {
        newMetrics = matchMetrics(data, metrics);
        return _.concat([], newMetrics);
      }
      return [];
    }
    return newMetrics;
  }
  const dynamicMetricMaps = () => {
    return _.filter(metricMap, (val) => {
      const { dynamic, filter } = val;
      if (!dynamic) return true;
      if (filter && filter.type && filter.value) {
        const newMetrics = filterMetrics(filter.type, filter.value, metrics);
        if (newMetrics && newMetrics.length !== 0) {
          return true;
        }
        return false;
      }
      return false;
    });
  }
  const renderMetricList = (metrics = [], metricTabKey: string) => {
    const selectedMetrics = props.metrics;
    return (
      <div className="tabPane" style={{maxHeight: 440, overflow: 'auto'}}>
        {
          metrics.length ?
            <ul className="metric-list" style={{ border: 'none' }}>
              {
                _.map(metrics, (metric, i) => {
                  return (
                    <li className="item" key={i} onClick={() => { handleMetricClick && handleMetricClick(metric); }}>
                      <Tooltip
                        key={`${metricTabKey}_${metric}`}
                        placement="right"
                        visible={metricTipVisible[`${metricTabKey}_${metric}`]}
                        title={() => {
                          const currentMetricMeta = getCurrentMetricMeta(metric);
                          if (currentMetricMeta) {
                            return (
                              <div>
                                <p>含义：{currentMetricMeta.meaning}</p>
                                <p>单位：{currentMetricMeta.unit}</p>
                              </div>
                            );
                          }
                          return '';
                        }}
                        onVisibleChange={(visible) => {
                          const key = `${metricTabKey}_${metric}`;
                          const currentMetricMeta = getCurrentMetricMeta(metric);
                          const metricTipVisibleCopy = JSON.parse(JSON.stringify(metricTipVisible));
                          if (visible && currentMetricMeta) {
                            metricTipVisibleCopy[key] = true;
                          } else {
                            metricTipVisibleCopy[key] = false;
                          }
                          setMetricTipVisible(metricTipVisibleCopy);
                        }}
                      >
                        <span>{metric}</span>
                      </Tooltip>
                      {getSelectedMetricsLen(metric, selectedMetrics)}
                    </li>
                  );
                })
              }
            </ul> :
            <div style={{ textAlign: 'center' }}>No data</div>
        }
      </div>
    );
  }
  const renderMetricTabs = () => {
    const metrics = normalizMetrics(activeKey);
    let newMetrics = metrics;
    if (searchValue) {
      try {
        const reg = new RegExp(searchValue, 'i');
        newMetrics = _.filter(metrics, (item) => {
          return reg.test(item);
        });
      } catch (e) {
        newMetrics = [];
      }
    }
    const newMetricMap = dynamicMetricMaps();
    const tabPanes = _.map(newMetricMap, (val) => {
      const tabName = val.alias;
      return (
        <TabPane tab={tabName} key={val.key}>
          { renderMetricList(newMetrics, val.key) }
        </TabPane>
      );
    });
    tabPanes.unshift(
      <TabPane tab='全部' key="ALL">
        { renderMetricList(newMetrics, 'ALL') }
      </TabPane>,
    );

    return (
      <Tabs
        style={{padding: 8, border: '1px solid #eee', paddingTop: 0}}
        tabBarStyle={{marginBottom: 10, height: 40}}
        activeKey={activeKey}
        onChange={handleMetricTabsChange}
      >
        {tabPanes}
      </Tabs>
    );
  }
  const handleMetricsSearch = (e: any) => {
    const { value } = e.target;
    setSearchValue(value)
  }
  return <div className='metric-select'>
    <div className='top-bar'>
      <Button>监控对象</Button>
      <Search onChange={handleMetricsSearch} />
    </div>
    {renderMetricTabs()}
  </div>
}
