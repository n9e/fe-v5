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
import { getMsTs } from './utils';
import { Options, XScales } from './interface';

export default class XAxis {
  options: Options;
  ctx: CanvasRenderingContext2D;
  constructor(userOptions: Options, ctx: CanvasRenderingContext2D) {
    this.options = userOptions;
    this.ctx = ctx;
  }

  init() {
    const {
      chart: { width },
      timestamp,
      xmin,
      xmax,
    } = this.options;
    const xScales = d3.scaleTime().range([0, width]);

    xScales.domain([getMsTs(xmax, timestamp), getMsTs(xmin, timestamp)]);
    return xScales;
  }

  draw(xScales: XScales) {
    const { ctx, options } = this;
    const { chart, xAxis, time } = options;
    const ticks = xScales.ticks(Math.floor(chart.width / 90)); // TODO:
    const tickBottom = chart.height - xAxis.tickpadding - xAxis.labels.fontSize;

    // draw tick
    ctx.beginPath();
    ticks.forEach((d) => {
      const xScalesedVal = xScales(d);
      if (xScalesedVal) {
        ctx.moveTo(xScalesedVal, tickBottom);
        ctx.lineTo(xScalesedVal, tickBottom - xAxis.tickLength);
      }
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = xAxis.tickColor;
    ctx.stroke();

    // draw line
    ctx.beginPath();
    ctx.moveTo(0, tickBottom - xAxis.tickLength);
    ctx.lineTo(chart.width, tickBottom - xAxis.tickLength);
    ctx.lineWidth = 1;
    ctx.strokeStyle = xAxis.lineColor;
    ctx.stroke();

    // draw labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = xAxis.labels.color;
    ctx.font = `${xAxis.labels.fontSize}px Palantino`;
    ticks.forEach((d) => {
      let timeFormat = '%H:%M';
      if (d.getSeconds() !== 0) {
        timeFormat = '%H:%M:%S';
      }
      if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
        timeFormat = '%m-%d';
      }

      let tzD = d;

      if (time && time.timezoneOffset) {
        const timezoneOffset = d.getTimezoneOffset();
        const ts = d.getTime();
        const destTs = ts + timezoneOffset * 60 * 1000 + time.timezoneOffset * 60 * 1000;
        tzD = new Date(destTs);
      }

      if (xScales(d)) {
        ctx.fillText(d3.timeFormat(timeFormat)(tzD), xScales(d), chart.height);
      }
    });
  }

  drawPlotLines(xScales: XScales) {
    const { ctx, options } = this;
    const {
      chart,
      xAxis,
      xAxis: { plotLines },
    } = options;
    const tickBottom = chart.height - xAxis.tickpadding - xAxis.labels.fontSize;

    if (Array.isArray(plotLines)) {
      plotLines.forEach((plotLine) => {
        const xValue = xScales(plotLine.value);
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(xValue, 0);
        ctx.lineTo(xValue, tickBottom - xAxis.tickLength);
        ctx.strokeStyle = plotLine.color;
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }
  }
}
