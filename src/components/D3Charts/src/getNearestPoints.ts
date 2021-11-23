import { GetNearestPointsFnParam, Serie, SerieDataItem, NearestPoint } from './interface';

function getMsTs(ts: number, type: string) {
  return type === 'X' ? ts * 1000 : ts;
}

function ascending(a: number | Date, b: number | Date): number {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function pickBy<T extends object>(obj: T, predicate: (key: keyof T) => boolean) {
  const newObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (Object.prototype.toString.call(predicate) === '[object Function]' && predicate(key)) {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
}

function bisector(compare: (d: SerieDataItem, x: Date) => number) {
  return {
    left: (a: any[], x: any, lo?: any, hi?: any) => {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        const mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: (a: any[], x: any, lo?: any, hi?: any) => {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        const mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    },
  };
}

export default function getNearestPoints(dat: GetNearestPointsFnParam) {
  const { series, x, xkey, ykey, timestamp, fillNull } = dat;
  const xBisect = bisector(
    (d, x) => {
      return ascending(getMsTs(d[xkey], timestamp), x);
    }
  ).left;
  const tsX = (new Date(x)).getTime();
  const nearestPoints: NearestPoint[] = [];

  if (Object.prototype.toString.call(series) !== '[object Array]') return [];
  series.forEach((serie, i) => {
    if (serie.visible === false) return;
    const { name, color } = serie;
    const serieWithEffective = pickBy<Serie>(serie, (key) => {
      return key !== 'data';
    });
    let { data = [] } = serie;
    if (Object.prototype.toString.call(data) !== '[object Array]') return;
    data = data.filter(item => typeof item[ykey] === 'number' || typeof fillNull === 'number');

    if (data.length === 0) return;

    let nearestPoint: NearestPoint;
    const pos = xBisect(data, x);
    const smaller = data[pos - 1];
    const larger = data[pos];

    if (smaller && larger) {
      const smallerX = getMsTs(smaller[xkey], timestamp);
      const largerX = getMsTs(larger[xkey], timestamp);
      let smallerY = smaller[ykey];
      let largerY = larger[ykey];

      if (smallerY === null && fillNull !== undefined) smallerY = fillNull;
      if (largerY === null && fillNull !== undefined) largerY = fillNull;

      if (tsX - smallerX < largerX - tsX) {
        nearestPoint = {
          ...smaller,
          name,
          color,
          timestamp: smallerX,
          value: smallerY,
          serieIndex: i,
          serieOptions: serieWithEffective,
        };
      } else {
        nearestPoint = {
          ...larger,
          name,
          color,
          timestamp: largerX,
          value: largerY,
          serieIndex: i,
          serieOptions: serieWithEffective,
        };
      }
      nearestPoints.push(nearestPoint);
    } else if (smaller) {
      const smallerX = getMsTs(smaller[xkey], timestamp);
      let smallerY = smaller[ykey];
      if (smallerY === null && fillNull !== undefined) smallerY = fillNull;
      nearestPoint = {
        ...smaller,
        name,
        color,
        timestamp: smallerX,
        value: smallerY,
        serieIndex: i,
        serieOptions: serieWithEffective,
      };
      nearestPoints.push(nearestPoint);
    } else if (larger) {
      const largerX = getMsTs(larger[xkey], timestamp);
      let largerY = larger[ykey];
      if (largerY === null && fillNull !== undefined) largerY = fillNull;
      nearestPoint = {
        ...larger,
        name,
        color,
        timestamp: largerX,
        value: largerY,
        serieIndex: i,
        serieOptions: serieWithEffective,
      };
      nearestPoints.push(nearestPoint);
    }
  });

  return nearestPoints;
}
