/*
 * @params:
 * title 标题，
 * id 图表id(不传自动生成)
 * type 图表类型，
 * dataSource 图表数据（line: [{name: 'chart1', data: [1,2,3,4,4]}],        pie: [{name: 'chartpie', data: [{value: 1, name: 1}]}]）
 * xAxis 横坐标（bar、line时传递），[1,2,3,4,5,6]
 * search 搜索刷新功能
 */
import React, { useEffect, useState } from 'react';
import { Chart } from './chart';
import { Spin } from 'antd';
import {
  ChartType,
  DataSource,
  ChartProps,
  LineData,
  PieData,
  BarData,
  isNumberArray,
  isPieArray,
} from '@/store/chart';
import {
  SettingOutlined,
  FullscreenOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import './index.less';
import { useTranslation } from 'react-i18next';
export { ChartType };
export function BaseChart(props: ChartProps): React.ReactElement {
  const { t } = useTranslation();
  const [option, setOption] = useState({});
  const {
    title,
    id = 'chart' + new Date().getTime(),
    // 没有id自动生成id
    type = ChartType.Line,
    dataSource = [],
    xAxis = [],
    search,
  } = props; // 处理图表类型参数

  const DealChartOptions = (type: ChartType) => {
    switch (type) {
      case 'line':
        let lines: LineData[] = [];
        dataSource.forEach((item) => {
          if (isNumberArray(item.data)) {
            lines.push({
              name: item.name,
              type: ChartType.Line,
              data: item.data,
            });
          }
        });
        setOption({
          series: lines,
          xAxis: {
            data: xAxis,
          },
        });
        break;

      case 'bar':
        let bars: BarData[] = [];
        dataSource.forEach((item) => {
          if (isNumberArray(item.data)) {
            bars.push({
              name: item.name,
              type: ChartType.Bar,
              data: item.data,
            });
          }
        });
        setOption({
          series: bars,
          xAxis: {
            data: xAxis,
          },
          yAxis: {
            type: 'value',
          },
        });
        break;

      case 'pie':
        let pies: PieData[] = [];
        dataSource.forEach((item) => {
          if (isPieArray(item.data)) {
            pies.push({
              name: item.name,
              type: ChartType.Pie,
              data: item.data,
            });
          }
        });
        setOption({
          series: pies,
        });
        break;
    }
  };

  useEffect(() => {
    // 根据图表类型二次处理数据
    DealChartOptions(type);
  }, [JSON.stringify(props.dataSource), JSON.stringify(props.xAxis)]);
  return (
    <div className='base-chart'>
      <div className='base-chart-header'>
        {title && <div className='header-left'>{title}</div>}
        <div className='header-right'>
          <span>
            <SettingOutlined />
          </span>
          <span>
            <FullscreenOutlined />
          </span>
          <span>
            <MenuOutlined />
          </span>
        </div>
      </div>
      {search && <div className='base-chart-select'>{search()}</div>}
      <div className='base-chart-main'>
        <Spin spinning={dataSource.length <= 0}>
          {(() => {
            const { t } = useTranslation();
            return (
              <div
                style={{
                  width: '100%',
                  height: '200px',
                }}
              >
                <Chart
                  chartId={id}
                  option={option}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
            );
          })()}
        </Spin>
      </div>
    </div>
  );
}
