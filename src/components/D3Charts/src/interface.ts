export type TsGraphType = {
  [index: string]: any,
}

export enum ChartType {
  Line = 'line',
  StackArea = 'stackArea'
}

export type Timestamp = 'x' | 'X';

export type BaseOptions = {
  xkey: number | string,
  ykey: number | string,
  y0key: number | string,
  timestamp: Timestamp,
}

export type Chart = {
  id: string,
  colors: string[],
  width: number,
  height: number,
  marginTop: number,
  marginRight: number,
  marginBottom: number,
  marginLeft: number,
  renderTo: HTMLElement,
  containerWidth: number,
  containerHeight: number,
}

export type PlotLine = {
  value: number,
  color: string,
}

export type XAxis = {
  lineColor: string,
  lineWidth: number,
  tickLength: number,
  tickpadding: number,
  tickColor: string,
  labels: {
    color: string,
    fontSize: number,
  },
  plotLines: PlotLine[],
}

export type YAxis = {
  min: number,
  max: number,
  lineColor: string,
  lineWidth: number,
  tickLength: number,
  tickpadding: number,
  tickColor: string,
  gridLineColor: string,
  labels: {
    color: string,
    shadowColor: string,
    fontSize: number,
    style: {
      fontSize: number,
      color: string,
    },
  },
  plotLines: PlotLine[],
}

export type Tooltip = {
  precision: number | 'origin' | 'short';
  shared: boolean,
  sharedSortDirection: 'asc' | 'desc',
  formatter: (points: Point[], originalPoints: Point[]) => string;
}

export type Legend = {
  align: string,
  verticalAlign: string,
  enabled: boolean,
}

export type Time = {
  timezoneOffset: number,
}

export type Point = {
  name: string,
  color: string,
  x: number,
  y: number,
  timestamp: number,
  value: number,
  serieIndex: number,
  filledNull?: number,
  serieOptions: Serie,
}

export type NearestPoint = {
  name: string,
  color: string,
  timestamp: number,
  value: number,
  serieIndex: number,
  filledNull?: number,
  serieOptions: Serie,
}

export type SerieDataItemMarker = {
  enabled: boolean,
  radius: number,
}

export type SerieDataItem = {
  [index: string]: any,
  marker?: SerieDataItemMarker,
  timestamp: number,
  value: number,
}

export interface Serie {
  name: string,
  color: string,
  visible: boolean,
  data: SerieDataItem[],
  lineDash?: number[],
}

export type Series = Serie[]

export interface GetNearestPointsFnParam extends BaseOptions {
  series: Series,
  x: Date,
  fillNull: undefined | number,
}

export interface Options extends BaseOptions {
  chartType: ChartType,
  ratio: number,
  chart: Chart,
  xAxis: XAxis,
  yAxis: YAxis,
  tooltip: Tooltip,
  line: {
    width: number,
  },
  series: Serie[],
  notDisplayedSeries: string[],
  legend: Legend,
  time: Time,
  fillNull: undefined | number,
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number,
  onClick: (d3Event: any) => any,
  onZoom: (getZoomedSeries: () => Series) => any,
  formatUnit: 1024 | 1000 | 'humantime'
}

export type EventPosition = {
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
}

export type Transform = {
  rescaleX: (xScales: any) => any,
} | undefined

export interface WorkerPostMessage extends BaseOptions {
  id?: string,
  str?: string,
  flag?: boolean,
  x: Date,
  fillNull: undefined | number,
}

export interface XScales {
  (a: number | Date): number,
  invert(value: number | { valueOf(): number }): Date,
  ticks(value: number): Date[],
}

export interface YScales {
  (a: number): number,
  domain(value: number[]): any,
  nice(value: number): any,
  ticks(value: number): number[],
}


