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
import { groupBy, keys, orderBy, isNumber } from 'lodash';
import { distanceBetweenPointsX, distanceBetweenPoints, getColor, formatTrim } from './utils';
import { Options, EventPosition, Point, WorkerPostMessage, XScales, YScales } from './interface';
import getNearestPoints from './getNearestPoints';
import Worker from './worker?worker';

const worker = new Worker();
const cache = {};
const series = {};

export default class Tooltip {
  options: Options;
  ctx: CanvasRenderingContext2D;
  flag: boolean;
  isMouserover: boolean;
  constructor(userOptions: Options, ctx: CanvasRenderingContext2D, container: HTMLElement, canvas: HTMLCanvasElement) {
    this.options = userOptions;
    this.ctx = ctx;
    this.flag = false;
    this.init(container, canvas);
    this.isMouserover = false;
  }

  init(container: HTMLElement, canvas: HTMLCanvasElement) {
    const {
      chart: { id },
    } = this.options;
    const tooltipNode = document.createElement('div');

    tooltipNode.id = `${id}-tooltip`;
    tooltipNode.className = 'ts-graph-tooltip';
    // 插到 eventCanvas 前，事件是绑定在 eventCanvas 层，防止 tooltip 遮挡
    if (!document.getElementById(tooltipNode.id)) {
      // container.insertBefore(tooltipNode, canvas);
      document.body.append(tooltipNode);
    }
  }

  clear() {
    const {
      ratio,
      chart: { id, containerWidth, containerHeight },
    } = this.options;
    const tooltipNode = document.getElementById(`${id}-tooltip`) as HTMLElement;

    this.isMouserover = false;
    this.ctx.save();
    this.ctx.setTransform(1 * ratio, 0, 0, 1 * ratio, 0, 0);
    this.ctx.clearRect(0, 0, containerWidth, containerHeight);
    this.ctx.restore();
    tooltipNode.style.top = '-99999px';
    // tooltipNode.style.visibility = 'hidden';
    if (tooltipNode.lastChild) {
      tooltipNode.removeChild(tooltipNode.lastChild);
    }
  }

  getNearestPoints(eventPosition: EventPosition, xScales: XScales, yScales: YScales, cbk: (nearestPoints: Point[]) => void) {
    const {
      series = [],
      chart: { id, colors },
      tooltip: { shared },
      xkey,
      ykey,
      y0key,
      timestamp,
      fillNull,
    } = this.options;
    const x = xScales.invert(eventPosition.offsetX);
    let nearestPoints: Point[] = [];
    const message: WorkerPostMessage = {
      x,
      xkey,
      ykey,
      y0key,
      timestamp,
      fillNull,
    };

    if (!this.flag) {
      message.id = id;
      message.str = JSON.stringify(series);
      message.flag = this.flag;
      worker.postMessage(message);
      this.flag = true;
    } else {
      message.id = id;
      message.flag = this.flag;
      worker.postMessage(message);
    }

    worker.onmessage = (event: any) => {
      if (this.isMouserover === false) return;

      if (Object.prototype.toString.call(event.data) === '[object Array]') {
        nearestPoints = event.data.map((item: Point) => {
          return {
            ...item,
            x: xScales(item.timestamp),
            y: yScales(item.value),
            color: item.color || getColor(colors, item.serieIndex),
          };
        });
      }
      // 不同时间点数据，还需要再处理一遍
      const nearestPointsGroup = groupBy(nearestPoints, 'x');

      if (keys(nearestPointsGroup).length > 1) {
        let minDistance = Number.POSITIVE_INFINITY;

        // eslint-disable-next-line no-restricted-syntax
        for (const key in nearestPointsGroup) {
          if (Object.prototype.hasOwnProperty.call(nearestPointsGroup, key)) {
            const d = distanceBetweenPointsX(eventPosition.offsetX, Number(key));

            if (d < minDistance) {
              minDistance = d;
              nearestPoints = nearestPointsGroup[key];
            }
          }
        }
      }

      if (!shared) {
        let minDistance = Number.POSITIVE_INFINITY;

        nearestPoints.forEach((point) => {
          const d = distanceBetweenPoints(
            {
              x: eventPosition.offsetX,
              y: eventPosition.offsetY,
            },
            point,
          );

          if (d < minDistance) {
            minDistance = d;
            nearestPoints = [point];
          }
        });
      }

      cbk(nearestPoints);
    };
  }

  draw(eventPosition: EventPosition, xScales: XScales, yScales: YScales, cbk?: (nearestPoints: Point[]) => void) {
    this.isMouserover = true;
    this.getNearestPoints(eventPosition, xScales, yScales, (nearestPoints) => {
      this.clear();
      if (nearestPoints.length) {
        this.drawCrosshair(nearestPoints[0].x);
        this.drawSymbol(nearestPoints);
        this.drawModal(nearestPoints, eventPosition);
      }
      if (cbk && Object.prototype.toString.call(cbk) === '[object Function]') {
        cbk(nearestPoints);
      }
    });
  }

  drawModal(nearestPoints: Point[], eventPosition: EventPosition) {
    const {
      chart: { id, renderTo },
      tooltip,
      time,
    } = this.options;
    const renderToWidth = renderTo.offsetWidth;
    let renderToHeight = renderTo.offsetHeight;
    const tooltipNode = document.getElementById(`${id}-tooltip`) as HTMLElement;
    const wrapEle = document.createElement('div');
    const originalNearestPoints = nearestPoints;

    renderToHeight = window.innerHeight / 1.5;

    // 最大可显示的行数，超出最大行数就在中位隐藏超出数量的行
    // 18: padding + border
    // 100: 缓冲区域
    // 15: 每行高度
    // + 1: 标题栏高度
    const maxLength = (renderToHeight - 18 - 100) / 15;
    let overflow = false;

    if (tooltip.sharedSortDirection) {
      nearestPoints = orderBy(
        nearestPoints,
        (point: Point) => {
          return point.value;
        },
        tooltip.sharedSortDirection,
      );
    }

    if (nearestPoints.length > maxLength) {
      nearestPoints = nearestPoints.slice(0, maxLength);
      overflow = true;
    }

    wrapEle.className = 'ts-graph-tooltip-content';
    tooltipNode.appendChild(wrapEle);

    if (Object.prototype.toString.call(tooltip.formatter) === '[object Function]') {
      wrapEle.innerHTML = tooltip.formatter([...nearestPoints], [...originalNearestPoints]);
    } else {
      const firstNearestPoint = nearestPoints[0];
      const frag = document.createDocumentFragment();
      const ulNode = document.createElement('ul');
      const headerNode = document.createElement('li');

      let tzD = new Date(firstNearestPoint.timestamp);

      if (time && time.timezoneOffset) {
        const timezoneOffset = tzD.getTimezoneOffset();
        const ts = tzD.getTime();
        const destTs = ts + timezoneOffset * 60 * 1000 + time.timezoneOffset * 60 * 1000;
        tzD = new Date(destTs);
      }
      const headerTextNode = document.createTextNode(d3.timeFormat('%Y-%m-%d %H:%M:%S')(tzD));

      headerNode.appendChild(headerTextNode);
      headerNode.style.color = '#666';
      ulNode.style.maxWidth = `${window.innerWidth / 1.5}px`; // 宽度最大值
      ulNode.appendChild(headerNode);
      frag.appendChild(ulNode);

      nearestPoints.forEach(({ color, name, value, filledNull }) => {
        const liNode = document.createElement('li');

        if (color) {
          const symbolNode = document.createElement('span');
          const symbolTextNode = document.createTextNode('● ');

          symbolNode.style.color = color;
          symbolNode.appendChild(symbolTextNode);
          liNode.appendChild(symbolNode);
        }

        if (name) {
          const nameTextNode = document.createTextNode(`${name}: `);

          liNode.appendChild(nameTextNode);
        }

        if (isNumber(value)) {
          const valueNode = document.createElement('strong');
          let formatValue;
          if (tooltip.precision === 'origin') {
            formatValue = value;
          } else if (tooltip.precision === 'short') {
            let text = d3.format('.5s')(value);
            formatValue = formatTrim(text);
          } else if (tooltip.precision > 0) {
            formatValue = d3.format(',.' + tooltip.precision + 'f')(value);
          } else {
            formatValue = d3.format(',.3f')(value);
          }
          formatValue += filledNull ? '(空值填补,仅限看图使用)' : '';

          const valueTextNode = document.createTextNode(formatValue);

          valueNode.appendChild(valueTextNode);
          liNode.appendChild(valueNode);
        }
        ulNode.appendChild(liNode);
      });

      if (overflow) {
        const overflowLiNode = document.createElement('li');
        const overflowLiTextNode = document.createTextNode('......');

        overflowLiNode.appendChild(overflowLiTextNode);
        ulNode.appendChild(overflowLiNode);
      }

      wrapEle.appendChild(frag);
    }

    const tooltipWidth = wrapEle.offsetWidth;
    const tooltipHeight = wrapEle.offsetHeight;

    tooltipNode.style.left = `${eventPosition.clientX - tooltipWidth - 20}px`;
    tooltipNode.style.top = `${eventPosition.clientY + 20}px`;

    if (eventPosition.clientX - tooltipWidth - 20 < 0) {
      tooltipNode.style.left = `${eventPosition.clientX + 20}px`;
      if (eventPosition.clientX + 20 + tooltipWidth > renderToWidth) {
        tooltipNode.style.left = '0px';
      }
    }

    if (eventPosition.clientY + 20 + tooltipHeight > renderToHeight) {
      if (eventPosition.clientY - tooltipHeight - 20 < 0) {
        tooltipNode.style.top = '0px';
      } else {
        tooltipNode.style.top = `${eventPosition.clientY - tooltipHeight - 20}px`;
      }
    }

    tooltipNode.style.zIndex = '9999';
    tooltipNode.style.visibility = 'visible';
  }

  drawSymbol(points: Point[] = []) {
    const { ctx } = this;

    points.forEach((point) => {
      const { x, y, color } = point;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 360, false);
      ctx.lineWidth = 1;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 360, false);
      ctx.lineWidth = 1;
      ctx.fillStyle = 'white';
      ctx.fill();
    });
  }

  drawCrosshair(x: number) {
    const { ctx, options } = this;
    const { chart, xAxis } = options;
    const tickBottom = chart.height - xAxis.tickpadding - xAxis.labels.fontSize - xAxis.tickLength;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, tickBottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = xAxis.lineColor;
    ctx.stroke();
  }

  destroy() {
    const {
      chart: { id },
    } = this.options;
    const tooltipNode = document.getElementById(`${id}-tooltip`) as HTMLElement;
    if (tooltipNode && tooltipNode.parentNode) {
      tooltipNode.parentNode.removeChild(tooltipNode);
    }
  }
}
