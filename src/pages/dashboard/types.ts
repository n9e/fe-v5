export interface IGridPos {
  h: number;
  w: number;
  x: number;
  y: number;
}

// query interface 
export interface ITarget {
  datasource: string; // prometheus | n9e
  expr: string; // promQL
  legendFormat: string;
  // format: string; // table | timeSeries 暂定，可能需要添加一个 format 来处理 table 形态
  // interval: number; // 目前夜莺使用的是全局 step
}

export interface ILink {
  title: string;
  url: string;
}

export interface IPanel {
  version: string; // 单个图表面板使用的版本，遵循版本规范 '1.0.0'
  id: number;
  title: string;
  links: ILink[];
  gridPos: IGridPos;
  targets: ITarget[];
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
}
