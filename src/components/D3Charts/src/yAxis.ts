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
import * as d3 from 'd3';
import { ChartType, Options, YScales } from './interface';

interface RealData {
  [index: string]: any;
}

export default class YAxis {
  options: Options;
  ctx: CanvasRenderingContext2D;
  tickLength: number;
  ticks: number[];
  constructor(userOptions: Options, ctx: CanvasRenderingContext2D) {
    this.options = userOptions;
    this.ctx = ctx;
    this.tickLength = Math.floor(userOptions.chart.height / 50);
    this.ticks = [];
  }

  init() {
    const { chart, xAxis } = this.options;
    const yScales = d3.scaleLinear().range([chart.height - (xAxis.labels.fontSize + xAxis.tickpadding + xAxis.tickLength), 20]);

    this.setDomain(yScales, this.options);
    return yScales;
  }

  /**
   * 返回真实的数据，其中包含 plotLines
   * @param  {Array}  data [description]
   * @return {Array}       [description]
   */
  getRealData(data: RealData) {
    const {
      yAxis: { plotLines },
      ykey,
      fillNull,
    } = this.options;

    if (Array.isArray(data)) {
      if (Array.isArray(plotLines)) {
        plotLines.forEach((plotLine) => {
          if (typeof plotLine.value === 'number') {
            data.push({
              [ykey]: plotLine.value,
            });
          }
        });
      }
      if (typeof fillNull === 'number') {
        data.push({
          [ykey]: fillNull,
        });
      }
      return data;
    }
    return [];
  }

  getPlotLinesMaxMin() {
    const { yAxis: { plotLines } } = this.options;
    let max: undefined | number;
    let min: undefined | number;
    if (Array.isArray(plotLines)) {
      plotLines.forEach((plotLine) => {
        if (!max || plotLine.value > max) {
          max = plotLine.value;
        }
        if (!min || plotLine.value < min) {
          min = plotLine.value;
        }
      });
    }
    return { max, min };
  }

  setDomain(yScales: YScales, { ymin, ymax }: { ymin: number; ymax: number }) {
    const { max: plotLineMax, min: plotLineMin } = this.getPlotLinesMaxMin();
    let realTickLength = this.tickLength;

    // TODO: Optimize the tick
    if (ymin === ymax) {
      const increment = (ymax - ymin) / (this.tickLength - 1);
      const halfIncrement = increment / 2 || ymax || 1;
      realTickLength = increment === 0 ? 1 : this.tickLength;

      ymin -= halfIncrement;
      ymax += halfIncrement;
    }

    if (ymin > ymax) {
      const cachemin = ymin;
      ymin = ymax;
      ymax = cachemin;
    }

    if (plotLineMin !== undefined && plotLineMin < ymin) {
      ymin = plotLineMin;
    }

    if (plotLineMax !== undefined && plotLineMax > ymax) {
      ymax = plotLineMax;
    }
    // StackArea 类型图表 y 轴下标总为 0
    if (this.options.chartType === ChartType.StackArea) ymin = 0;

    yScales.domain([ymin, ymax]);
    yScales.nice(realTickLength);
    this.ticks = yScales.ticks(realTickLength);
  }

  draw(yScales: YScales) {
    const { ctx, options } = this;
    const { yAxis } = options;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = yAxis.labels.shadowColor;
    ctx.shadowBlur = 1;
    ctx.lineWidth = 1;
    ctx.fillStyle = yAxis.labels.color;
    ctx.font = `${yAxis.labels.fontSize}px Palantino`;
    this.ticks.forEach((d) => {
      let text: string = String(d);
      if (d >= 1000) {
        text = d3.format('.5s')(d);
        // trim insignificant zeros
        const siPrefixReg = /[kMGTPEZY]$/;
        if (siPrefixReg.test(text)) {
          const siPrefix = text[text.length - 1];
          text = text.replace(siPrefixReg, '');
          text = parseFloat(text) + siPrefix;
        }
      }
      const y = yScales(d);
      ctx.strokeText(text, 0, y);
      ctx.fillText(text, 0, y);
    });
  }

  drawGridLine(yScales: YScales) {
    const { ctx, options } = this;
    const { chart, yAxis } = options;

    ctx.beginPath();
    this.ticks.forEach((d) => {
      const yValue = yScales(d);
      ctx.moveTo(0, yValue);
      ctx.lineTo(chart.width, yValue);
    });
    ctx.strokeStyle = yAxis.gridLineColor;
    ctx.stroke();
  }

  drawPlotLines(yScales: YScales) {
    const { ctx, options } = this;
    const {
      chart,
      yAxis,
      yAxis: { plotLines },
    } = options;

    if (Array.isArray(plotLines)) {
      plotLines.forEach((plotLine) => {
        const yValue = yScales(plotLine.value);
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(0, yValue);
        ctx.lineTo(chart.width, yValue);
        ctx.strokeStyle = plotLine.color;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 1;
        ctx.lineWidth = 1;
        ctx.fillStyle = plotLine.color;
        ctx.font = `${yAxis.labels.fontSize}px Palantino`;
        ctx.strokeText(String(plotLine.value), chart.width - 10, yValue);
        ctx.fillText(String(plotLine.value), chart.width - 10, yValue);
      });
    }
  }
}
