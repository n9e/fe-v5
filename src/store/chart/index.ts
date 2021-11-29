import dayjs from 'dayjs';
import { Range } from '@/components/DateRangePicker';
export enum ChartType {
  Line = 'line',
  Pie = 'pie',
  Bar = 'bar',
}

export interface DataSource {
  name: string;
  data: Array<number | PieDataSource>;
  sampling?: string;
}

export interface PieDataSource {
  value: number;
  name: string;
}

export function isNumberArray(s: any): s is number[] {
  if (s.length) {
    return typeof s[0] === 'number';
  } else {
    return true;
  }
}

export function isPieArray(s: any): s is PieDataSource[] {
  if (s.length) {
    return typeof s[0] !== 'number';
  } else {
    return true;
  }
}

export interface ChartProps {
  title?: string; // 图表标题
  id?: string; //  图表唯一id
  type: ChartType; // 图表类型
  dataSource: Array<DataSource> | []; // 图表的数据源
  xAxis?: Array<string | number> | []; // 图表的x轴
  search?: any;
}

export interface LineData {
  name?: string;
  type: ChartType.Line;
  data: Array<number>;
}

export interface BarData {
  name?: string;
  type: ChartType.Bar;
  data: Array<number>;
}

interface PieSeriesItem {
  value: number;
  name: string;
}

export interface PieData {
  name?: string;
  type: ChartType.Pie;
  data: PieSeriesItem[];
}

export interface Tag {
  key: string;
  value: string;
}

export interface TagForVariable extends Tag {
  metric: string;
}

export interface ChartComponentProps {
  range: Range;
  limit: number;
  metric: string | string[];
  idents?: string[];
  description?: string;
  tags?: Tag[];
  classpath_id?: number;
  classpath_prefix?: Boolean;
  prome_ql?: string[] | string;
  yplotline?: number;
  xplotline?: number; //秒
  step?: number | null;
}

export interface ChartFilterProps {
  start: number;
  end: number;
  limit: number;
  metric?: string | string[];
  description?: string;
  tags?: Tag[];
  idents?: string[];
}
