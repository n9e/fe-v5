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
import { Range } from '@/components/DateRangePicker';
export interface IGridPos {
  h: number;
  w: number;
  x: number;
  y: number;
  i: string;
}

// query interface
export interface ITarget {
  refId: string;
  expr: string; // promQL
  legendFormat: string;
  time?: Range; // 固定时间范围
  step?: number; // 固定时间间隔
}

export type IType = 'row' | 'timeseries' | 'stat' | 'table' | 'pie' | 'hexbin';

export interface IValueMapping {
  match: {
    special?: string | number;
    from?: number;
    to?: number;
  };
  result: {
    color: string;
    text: string;
  };
  type: 'range' | 'special' | 'specialValue'; // TODO: 历史原因 special 是固定值，specialValue 是特殊值
}

export interface IThresholds {
  steps: {
    color: string;
    value: number;
  }[];
  // mode: 'absolute' | 'percent'; 目前不支持
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
  legend?: {
    // TODO: 目前不支持这么复杂的自定义
    calcs: string[];
    displayMode: 'list' | 'table' | 'hidden';
    placement: 'right' | 'bottom';
  };
  tooltip?: {
    mode: 'single' | 'all';
    sort: 'none' | 'asc' | 'desc';
  };
}

export interface IOverride {
  matcher: {
    type: 'byName'; // 目前只支持 byName
    value: string;
  };
  properties: {
    [key: string]: any; // standardOptions | valueMappings
  };
}

export interface ILink {
  title: string;
  url: string;
  targetBlank?: boolean;
}

export interface ITimeseriesStyles {
  version: string; // 时序图组件使用的版本
  drawStyle: 'lines' | 'bars';
  lineInterpolation: 'linear' | 'smooth';
  fillOpacity: number;
  stack: 'off' | 'noraml'; // off 关闭；normal 开启，此结构未后期其他模式预留
}

export interface IStatStyles {
  version: string; // 时序图组件使用的版本
  textMode: 'valueAndName' | 'value';
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

export interface IHexbinStyles {
  version: string; // 时序图组件使用的版本
  calc: string;
  colorRange: string[]; // 三个颜色值
  colorDomainAuto: boolean;
  colorDomain: number[]; // 自定义 [min, max]
  reverseColorOrder: boolean;
}
export interface IPieStyles {
  version: string; // 时序图组件使用的版本
  calc: string;
  legengPosition: string;
}
export interface IRow {
  id: string;
  type: 'row';
  title: string;
  collapsed: boolean;
  layout: IGridPos;
}

export interface IPanel {
  version: string; // 单个图表面板使用的版本
  id: string;
  name: string;
  links?: ILink[];
  description: string;
  layout: IGridPos;
  targets: ITarget[];
  type: IType;
  options: IOptions;
  custom: any; // 图表
  overrides: IOverride[];
  collapsed?: boolean; // 用于 row 展开收起控制是否显示
  panels?: IPanel[]; // 用于 row 收起时保存子面板
}

export interface IVariable {
  name: string;
  definition: string;
  options?: string[];
  allOption?: boolean;
  multi?: boolean;
}

// IDashboard.configs
export interface IDashboard {
  version: string; // 整个仪表盘使用的版本，遵循版本规范 '1.0.0'
  links: ILink[];
  var: IVariable[]; // 变量配置
  panels: IPanel[];
}
