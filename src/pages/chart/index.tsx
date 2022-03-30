import React, { useEffect, useState } from 'react';
import semver from 'semver';
import { GetTmpChartData } from '@/services/metric';
import { useParams } from 'react-router';
import DateRangePicker, { isAbsoluteRange, RelativeRange } from '@/components/DateRangePicker';
import { Range } from '@/components/DateRangePicker';
import { AreaChartOutlined, DownOutlined, FieldNumberOutlined, LineChartOutlined } from '@ant-design/icons';
import Resolution from '@/components/Resolution';
import './index.less';
import { useTranslation } from 'react-i18next';
import Graph from '@/components/Graph';
import { GraphDataProps } from '@/components/Graph/Graph/index';
import _ from 'lodash';
import { Button, Dropdown, Radio, Menu, Tooltip, Space } from 'antd';
import { ChartType } from '@/components/D3Charts/src/interface';
import { HighLevelConfigType } from '@/components/Graph/Graph/index';
import { useSelector } from 'react-redux';
import { CommonStoreState } from '@/store/commonInterface';
import { RootState } from '@/store/common';
import Renderer from '../dashboard/Renderer/Renderer';

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
  const [range, setRange] = useState<Range>({
    num: 1,
    unit: 'hour',
    description: t('小时'),
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

  const handleDateChange = (e) => {
    if (isAbsoluteRange(e) ? !_.isEqual(e, range) : e.num !== (range as RelativeRange).num || e.unit !== (range as RelativeRange).unit) {
      setRange(e);
    }
  };

  const handleRefresh = () => {
    initChart();
  };

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
                <DateRangePicker onChange={handleDateChange} value={chartData[0].dataProps.range} />
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
              {/* <ResfeshIcon onClick={handleRefresh} className='reload-icon' /> */}
            </div>
          </div>
          {chartData.map((item: any, index) => {
            if (semver.valid(item.dataProps?.version)) {
              return (
                <div style={{ height: 400, border: '1px solid #efefef' }}>
                  <Renderer dashboardId={item.id} key={index} time={range} step={step} type={item.dataProps?.type} values={item.dataProps as any} isPreview />
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
