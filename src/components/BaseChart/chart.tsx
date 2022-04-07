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
