import React, { useEffect, useRef } from 'react';
import * as Echarts from 'echarts';
import { ChartType } from '@/store/chart';
import { chartDefaultOptions } from '@/utils/constant';
import { useTranslation } from 'react-i18next';
interface LineProps {
  chartId: string;
  option?: object;
  style?: object;
}
export function Chart(props: LineProps) {
  const { t } = useTranslation();
  const { chartId, option, style } = props;
  const chartRef = useRef(null as any);
  const chartInstance = useRef(null as any);
  useEffect(() => {
    const { current: node } = chartRef;

    if (!chartInstance.current) {
      chartInstance.current = Echarts.init(node);
    }

    renderChart();
  }, [JSON.stringify(option)]); // 图表配置及渲染

  const renderChart = () => {
    // 合并参数
    let options = chartDefaultOptions;

    if (option) {
      options = Object.assign(options, option);
    }

    chartInstance.current.clear();
    chartInstance.current.off('click');
    chartInstance.current.setOption(options);
  }; // 布局变化，重新渲染

  const resizeChart = () => {
    chartInstance.current.resize();
  };

  window.onresize = () => {
    resizeChart();
  };

  return <div ref={chartRef} id={chartId} style={{ ...style }}></div>;
}
