import { Timestamp } from './interface';

type Point = {
  x: number,
  y: number,
};

export function distanceBetweenPointsX(x1: number, x2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2));
}

export function distanceBetweenPoints(pt1: Point, pt2: Point) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}

export function getColor(colors: string[], i: number): string {
  const len = colors.length;
  if (i < len) {
    return colors[i];
  }
  return getColor(colors, i - len);
}

export function dateFormat(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}
    ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}

export function getRatio() {
  return window.devicePixelRatio ? window.devicePixelRatio : 2;
}

export function dateStrToTs(date: string) {
  return (new Date(date)).getTime();
}

export function getMsTs(ts: number, type: Timestamp) {
  return type === 'X' ? ts * 1000 : ts;
}

// 获取在移动端的偏移位置
export function getTouchPosition(el: HTMLCanvasElement, d3Event: any) {
  const vertex = el.getBoundingClientRect();
  const clientX = d3Event.changedTouches[0].clientX;
  const clientY = d3Event.changedTouches[0].clientY;
  const x = clientX - vertex.left;
  const y = clientY - vertex.top;
  return {
    offsetX: x,
    offsetY: y,
    clientX,
    clientY,
  };
}

export function formatTrim(s: string) {

  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {

    switch (s[i]) {

      case ".": i0 = i1 = i; break;

      case "0": if (i0 === 0) i0 = i; i1 = i; break;

      default: if (i0 > 0) { if (!+s[i]) break out; i0 = 0; } break;

    }

  }

  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;

}