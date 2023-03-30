export interface BaseParams {
  cate: string;
  cluster: string;
}

export interface Group {
  name: string;
  groupid: string;
}

export interface Host {
  name: string;
  hostid: string;
}

export interface App {
  name: string;
  applicationid: string;
}

export interface Item {
  name: string;
  itemid: string;
  value_type: string;
}

export enum FuncCate {
  Transform = 'Transform',
  Aggregate = 'Aggregate',
  Filter = 'Filter',
  Trends = 'Trends',
  Time = 'Time',
  Alias = 'Alias',
  Special = 'Special',
}

export interface FuncDef {
  name: string;
  params: ParamDef[];
  defaultParams: Array<string | number>;
}

export type ParamDef = {
  name: string;
  type: 'string' | 'float' | 'int';
  options?: Array<string | number>;
};

export interface FuncValue {
  name: string;
  params: Array<string | number>;
}

export interface Options {
  showDisabledItems: boolean;
  useZabbixValueMapping: boolean;
  disableDataAlignment: boolean;
}

export interface BaseQuery {
  group: {
    filter: string;
  };
  host: {
    filter: string;
  };
  application: {
    filter: string;
  };
  item: {
    filter: string;
  };
  options: Options;
}

export interface TargetQuery extends BaseQuery {
  functions: FuncValue[];
}

export interface TargetQueryIDs {
  itemids: string;
  functions: FuncValue[];
  options: Options;
}

export interface TargetQueryText extends TargetQuery {
  mode: 'timeseries' | 'text';
  textFilter: string;
  useCaptureGroups: boolean;
  items?: Item[];
}

export interface DBQuery extends BaseQuery {
  start: number;
  end: number;
  queryType: '0';
  functions: {
    def: FuncDef;
    params: Array<string | number>;
  }[];
}

export interface DBQueryIDs {
  start: number;
  end: number;
  queryType: '3';
  itemids: string;
  functions: {
    def: FuncDef;
    params: Array<string | number>;
  }[];
  options: Options;
}

export interface LogsQuery {
  method: 'history.get';
  params: {
    history: string;
    itemids: string[];
    time_from: number;
    time_till: number;
    output: 'extend';
  };
}
