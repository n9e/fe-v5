export interface IGridPos {
  h: number;
  w: number;
  x: number;
  y: number;
}

// query interface 
export interface ITarget {
  expr: string; // promQL
  legendFormat: string;
  // format: string; // table | timeSeries 暂定，可能需要添加一个 format 来处理 table 形态
}

export interface ILink {
  title: string;
  url: string;
}

export type IType = 'timeseries' | 'stat' | 'table' | 'pie';

export interface IValueMapping {
  match: {
    special?: string | number;
    from?: number;
    to?: number
  };
  result: {
    color: string;
    text: string;
  };
  type: 'range' | 'special'
}

export interface IThresholds {
  steps: {
    color: string;
    value: number;
  }[];
  style: 'line'; // 目前只支持 line
}

// 一些通用的配置，不同类型的图表可选择性使用配置
export interface IOptions {
  valueMappings?: IValueMapping[];
  thresholds?: IThresholds;
  standardOptions?: {
    util?: string;
    min?: number;
    max?: number;
    decimals?: number;
  };
  legend?: { // TODO: 目前不支持这么复杂的自定义
    calcs: string[];
    displayMode: 'list' | 'hidden';
    placement: 'right' | 'bottom'
  };
  tooltip?: {
    mode: 'single' | 'all',
    sort: 'none' | 'asc' | 'desc'
  };
}

export interface IOverride {
  matcher: {
    type: 'byName'; // 目前只支持 byName
    value: string;
  },
  properties: {
    [key: string]: any; // standardOptions | valueMappings
  }
}

export interface ITimeseriesStyles {
  version: string; // 时序图组件使用的版本
  drawStyle: 'lines' |'bars';
  lineInterpolation: 'linear' | 'smooth';
  fillOpacity: number;
  stack: 'off' | 'noraml'; // off 关闭；normal 开启，此结构未后期其他模式预留
}

export interface IStatStyles {
  version: string; // 时序图组件使用的版本
  textMode: 'valueAndName' |'value';
  textSize: {
    title: number;
    value: number;
  };
  calc: string;
  colorMode: 'value' | 'background';
}

export interface ITableStyles {
  version: string; // 时序图组件使用的版本
  showHeader: boolean;
  colorMode: 'value' | 'background';
  calc: string;
  displayMode: 'seriesToRows' | 'labelValuesToRows';
  // aggrOperator: string;
  aggrDimension: string;
}

export interface IPanel {
  version: string; // 单个图表面板使用的版本
  id: number;
  name: string;
  link: string;
  description: string;
  layout: IGridPos;
  targets: ITarget[];
  type: IType;
  options: IOptions;
  custom: any; // 图表
  overrides: IOverride[];
}

export interface IDashboard {
  version: string; // 整个仪表盘使用的版本，遵循版本规范 '1.0.0'
  id: number;
  title: string;
  cluster: string;
  time: {
    start: number;
    end: number;
  };
  refresh: string; // off | 10s ...
  variable: any; // 变量配置
  editable: boolean; // 备用
  panels: IPanel[];
}
