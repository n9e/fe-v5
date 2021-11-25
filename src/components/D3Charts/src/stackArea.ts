import * as d3 from 'd3';
import { sortBy } from 'lodash';
import { getColor } from './utils';
import { Options, Serie, SerieDataItem, XScales, YScales } from './interface';

export default class StackArea {
  options: Options;
  ctx: CanvasRenderingContext2D;
  constructor(userOptions: Options, ctx: CanvasRenderingContext2D) {
    this.options = userOptions;
    this.ctx = ctx;
  }

  draw(xScales: XScales, yScales: YScales) {
    const {
      series,
      chart: { colors },
      xkey,
      ykey,
      timestamp,
      fillNull,
      notDisplayedSeries,
    } = this.options;
    const { ctx } = this;
    const line = d3
      .area()
      .x((d: SerieDataItem) => {
        const xVal = timestamp === 'X' ? d[xkey] * 1000 : d[xkey];
        const x = xScales(new Date(xVal));
        return x;
      })
      .y0((d: SerieDataItem) => {
        const val = d[2];
        if (typeof val === 'number') {
          return yScales(val);
        } else if (typeof fillNull === 'number') {
          return yScales(fillNull);
        }
        return undefined;
      })
      .y1((d: SerieDataItem) => {
        const val = d[1];
        if (typeof val === 'number') {
          return yScales(val);
        } else if (typeof fillNull === 'number') {
          return yScales(fillNull);
        }
        return undefined;
      })
      .defined((d: SerieDataItem) => {
        const val = d[ykey];
        return typeof val === 'number' || typeof fillNull === 'number';
      })
      .context(ctx);
    sortBy(series, 'zIndex')
      .reverse()
      .forEach((serie: Serie, i: number) => {
        if (serie.visible === false) return;
        if (notDisplayedSeries.indexOf(serie.name) > -1) return;

        const color = serie.color || getColor(colors, i);

        serie.color = color;
        ctx.beginPath();

        ctx.lineTo(0, 0); // TODO: fix don't draw the first single point

        line(serie.data || []);
        ctx.lineJoin = 'round';
        ctx.lineWidth = this.options.line.width;
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '50';
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
      });
  }
}
