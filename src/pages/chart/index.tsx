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
import React, { useEffect, useState } from 'react';
import semver from 'semver';
import { Button, Dropdown, Radio, Menu, Tooltip, Space } from 'antd';
import { AreaChartOutlined, DownOutlined, FieldNumberOutlined, LineChartOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GetTmpChartData } from '@/services/metric';
import { TimeRangePickerWithRefresh, IRawTimeRange } from '@/components/TimeRangePicker';
import Resolution from '@/components/Resolution';
import Graph from '@/components/Graph';
import { ChartType } from '@/components/D3Charts/src/interface';
import { HighLevelConfigType } from '@/components/Graph/Graph/index';
import { CommonStoreState } from '@/store/commonInterface';
import { RootState } from '@/store/common';
import Renderer from '../dashboard/Renderer/Renderer';
import { getStepByTimeAndStep } from '../dashboard/utils';
import './index.less';

export default function Chart() {
  const { t } = useTranslation();
  const { ids } =
    useParams<{
      ids: string;
    }>();
  const [chartData, setChartData] = useState<
    Array<{
      ref: any;
      dataProps: any;
      highLevelConfig: HighLevelConfigType;
    }>
  >([]);
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const [step, setStep] = useState<number | null>(null);
  const [chartType, setChartType] = useState<ChartType>(ChartType.Line);
  const { clusters } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [curCluster, setCurCluster] = useState<string>('');

  useEffect(() => {
    initChart();
  }, []);

  const initChart = () => {
    GetTmpChartData(ids).then((res) => {
      let data = res.dat
        .filter((item) => !!item)
        .map((item) => {
          return { ...JSON.parse(item.configs), ref: React.createRef() };
        });
      const curCluster = data[0].curCluster;
      setChartType(data[0].dataProps.chartType || ChartType.Line);
      setStep(data[0].dataProps.step);
      setRange(data[0].dataProps.range);
      // TODO: 处理当前选中集群不在集群列表的情况
      setCurCluster(curCluster);
      localStorage.setItem('curCluster', curCluster);
      setChartData(data);
    });
  };

  const clusterMenu = (
    <Menu selectedKeys={[curCluster]}>
      {clusters.map((cluster) => (
        <Menu.Item
          key={cluster}
          onClick={(_) => {
            setCurCluster(cluster);
            localStorage.setItem('curCluster', cluster);
            chartData.forEach((item) => item.ref.current.refresh());
          }}
        >
          {cluster}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className='chart-container'>
      {chartData && chartData.length > 0 && curCluster ? (
        <>
          <div className='chart-container-header'>
            <div className='left'></div>
            <div className='right'>
              <Space>
                <div>
                  <span>集群：</span>
                  <Dropdown overlay={clusterMenu}>
                    <Button>
                      {curCluster} <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
                <TimeRangePickerWithRefresh refreshTooltip={`刷新间隔小于 step(${getStepByTimeAndStep(range, step)}s) 将不会更新数据`} onChange={setRange} value={range} />
                <Resolution onChange={(v) => setStep(v)} initialValue={step} />
                {!semver.valid(chartData[0].dataProps?.version) && (
                  <Radio.Group
                    options={[
                      { label: <LineChartOutlined />, value: ChartType.Line },
                      { label: <AreaChartOutlined />, value: ChartType.StackArea },
                    ]}
                    onChange={(e) => {
                      e.preventDefault();
                      setChartType(e.target.value);
                    }}
                    value={chartType}
                    optionType='button'
                    buttonStyle='solid'
                  />
                )}
              </Space>
            </div>
          </div>
          {chartData.map((item: any, index) => {
            if (semver.valid(item.dataProps?.version)) {
              return (
                <div style={{ height: 740, border: '1px solid #efefef' }}>
                  <Renderer
                    dashboardId={item.id}
                    key={index}
                    time={range}
                    step={step}
                    values={_.merge({}, item.dataProps, {
                      options: {
                        legend: {
                          displayMode: 'table',
                        },
                      },
                    })}
                    isPreview
                  />
                </div>
              );
            }
            const newItem = {
              ...item.dataProps,
              range,
              step,
              chartType,
              title: (
                <Tooltip
                  placement='bottomLeft'
                  title={() => (
                    <div>
                      {item.dataProps.promqls?.map((promql) => {
                        return <div>{promql.current ? promql.current : promql}</div>;
                      })}
                    </div>
                  )}
                >
                  <Button size='small' type='link'>
                    promql 语句
                  </Button>
                </Tooltip>
              ),
            };
            return <Graph ref={item.ref} key={index} data={{ ...newItem }} graphConfigInnerVisible={false} isShowShare={false} highLevelConfig={item.highLevelConfig || {}} />;
          })}
        </>
      ) : (
        <h2 className='holder'>
          <FieldNumberOutlined
            style={{
              fontSize: '30px',
            }}
          />
          <span>{t('该分享链接无图表数据')}</span>
        </h2>
      )}
    </div>
  );
}
