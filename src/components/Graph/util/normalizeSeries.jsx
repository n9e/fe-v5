/* eslint-disable no-use-before-define */
import _ from 'lodash';
import { hexPalette } from '../config';

export default function normalizeSeries(data, treeData) {
  const series = [];
  _.each(data, (o, i) => {
    const id = o?.metric?.ident || o?.metric?.__name__;
    const color = getSerieColor(o, i);

    const serie = {
      id: i,
      name: id,
      tags: id,
      metricLabels: o.metric,
      data: (o.values || []).map((v) => [v[0] * 1000, Number(v[1])]) || [],
      lineWidth: 2,
      color,
      oldColor: color,
      comparison: o.offset,
    };
    series.push(serie);
  });

  return series;
}

function getSerieColor(serie, serieIndex, isComparison) {
  const { comparison } = serie;
  let color;
  // 同环比固定曲线颜色
  if (isComparison && !comparison) {
    // 今天绿色
    color = 'rgb(67, 150, 30)';
  } else if (comparison === 86400) {
    // 昨天蓝色
    color = 'rgb(98, 127, 202)';
  } else if (comparison === 604800) {
    // 上周红色
    color = 'rgb(238, 92, 90)';
  } else {
    const colorIndex = serieIndex % hexPalette.length;
    color = hexPalette[colorIndex];
  }

  return color;
}
