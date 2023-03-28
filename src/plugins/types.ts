export interface Target<T> {
  refId: string;
  expr: string; // promQL
  legendFormat: string;
  time?: Range; // 固定时间范围
  step?: number; // 固定时间间隔
  query: T;
}

export interface DBQueryParams<T> {
  cate: string;
  cluster: string;
  query: T[];
}

export interface Serie {
  id: string;
  name: string;
  metric: {
    [index: string]: string;
  };
  data: Array<[number, number]>;
}
