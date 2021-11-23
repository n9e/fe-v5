import * as d3 from 'd3';
import { sortBy } from 'lodash';
import { getColor } from './utils';
import { Options, Serie, SerieDataItem, XScales, YScales } from './interface';

export default class Line {
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
    sortBy(series, 'zIndex').forEach((serie: Serie, i: number) => {
      if (serie.visible === false) return;
      if (notDisplayedSeries.indexOf(serie.name) > -1) return;

      const color = serie.color || getColor(colors, i);

      serie.color = color;
      ctx.beginPath();

      const line = d3
        .area()
        .x((d: SerieDataItem) => {
          const xVal = timestamp === 'X' ? d[xkey] * 1000 : d[xkey];
          const x = xScales(new Date(xVal));

          return x;
        })
        .y((d: SerieDataItem) => {
          const val = d[ykey];
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

      ctx.lineTo(0, 0); // TODO: fix don't draw the first single point

      line(serie.data || []);
      ctx.lineJoin = 'round';
      ctx.lineWidth = this.options.line.width;
      ctx.strokeStyle = color;
      ctx.lineCap = 'round';
      ctx.setLineDash(serie.lineDash || []);
      ctx.stroke();
      ctx.closePath();
    });
  }
}
