import getNearestPoints from './getNearestPoints';
import { Serie } from './interface';

type CacheType = {
  [index: string]: string;
};
type SeriesType = {
  [index: string]: Serie[];
};

const cache: CacheType = {};
const series: SeriesType = {};
const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
  const { data } = event;

  if (data.id) {
    if (!cache[data.id] || !data.flag) {
      cache[data.id] = data.str;
      series[data.id] = JSON.parse(data.str);
    }
  }

  const nearestPoints = getNearestPoints({
    x: data.x,
    xkey: data.xkey,
    ykey: data.ykey,
    y0key: data.y0key,
    timestamp: data.timestamp,
    series: series[data.id],
    fillNull: data.fillNull,
  });

  ctx.postMessage(nearestPoints); // TODO: targetOrigin
});

export default ctx;
