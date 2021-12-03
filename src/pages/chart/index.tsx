import React, { useEffect, useState } from 'react';
import { GetTmpChartData } from '@/services/metric';
import { useParams } from 'react-router';
import DateRangePicker, { isAbsoluteRange, RelativeRange } from '@/components/DateRangePicker';
import { Range } from '@/components/DateRangePicker';
import { AreaChartOutlined, FieldNumberOutlined, LineChartOutlined } from '@ant-design/icons';
import ResfeshIcon from '@/components/RefreshIcon';
import Resolution from '@/components/Resolution';
import './index.less';
import { useTranslation } from 'react-i18next';
import Graph from '@/components/Graph';
import { GraphDataProps } from '@/components/Graph/Graph/index';
import _ from 'lodash';
import { Radio } from 'antd';
import { ChartType } from '@/components/D3Charts/src/interface';

export default function Chart() {
  const { t } = useTranslation();
  const { ids } =
    useParams<{
      ids: string;
    }>();
  const [chartData, setChartData] = useState<
    Array<{
      dataProps: GraphDataProps;
      state: {
        defaultAggrFunc: string;
        defaultAggrGroups: string[];
        defaultOffsets: string[];
      };
    }>
  >([]);
  const [range, setRange] = useState<Range>({
    num: 1,
    unit: 'hour',
    description: t('小时'),
  });
  const [step, setStep] = useState<number | null>(null);
  const [chartType, setChartType] = useState<ChartType>(ChartType.Line);

  useEffect(() => {
    initChart();
  }, []);

  const initChart = () => {
    GetTmpChartData(ids).then((res) => {
      let data = res.dat
        .filter((item) => !!item)
        .map((item) => {
          return JSON.parse(item.configs);
        });
      setChartType(data[0].dataProps.chartType);
      setStep(data[0].dataProps.step);
      setRange(data[0].dataProps.range);
      setChartData(data);
    });
  };

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
      {chartData && chartData.length > 0 ? (
        <>
          <div className='chart-container-header'>
            <DateRangePicker onChange={handleDateChange} value={chartData[0].dataProps.range} />
            <Resolution onChange={(v) => setStep(v)} initialValue={step} />
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
            {/* <ResfeshIcon onClick={handleRefresh} className='reload-icon' /> */}
          </div>
          {chartData.map((item, index) => {
            const newItem = {
              ...item.dataProps,
              range,
              step,
              chartType,
            };
            return (
              <Graph
                key={index}
                data={{ ...newItem }}
                graphConfigInnerVisible={false}
                isShowShare={false}
                defaultAggrFunc={item.state.defaultAggrFunc}
                defaultAggrGroups={item.state.defaultAggrGroups}
                defaultOffsets={item.state.defaultOffsets}
              />
            );
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
