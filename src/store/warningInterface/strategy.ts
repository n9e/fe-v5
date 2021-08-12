import { baseFavoriteItem, favoriteGroup } from '../common';
export type TagKey = {
  key: string;
};

export type TagValue = {
  value: string;
};

export type TagKeysRes = {
  dat: {
    keys: Array<string>;
  };
};

export type TagValuesRes = {
  dat: {
    values: Array<string>;
  };
};

export type Expression = {
  optr: string;
  func: string;
  metric: string;
  params?: Array<number>;
  threshold: number;
};

export type ResourceFilterCondition = {
  params: number | Array<string>;
  func: string;
};

export type TagFilterCondition = {
  key: string;
  func: string;
};

export type AppendTagFilterCondition = {
  tagk: Array<string>;
  tagv: Array<string>;
};

export type Metric = {
  name: string;
  description: string;
  promql?: string;
};

export type MetricListRes = {
  dat: {
    list: Array<Metric>;
  };
};

export enum strategyType {
  n9e = 0,
  prometheus = 1,
}

export enum strategyStatus {
  Enable = 0,
  UnEnable = 1,
}

export enum notifyType {
  Send = 0,
  UnSend = 1,
}

export enum strategyPriority {
  First = 1,
  Second = 2,
  Third = 3,
}
export interface strategyItem {
  id: number;
  group_id: number;
  name: string;
  type: strategyType;
  expression: {
    promql: string;
  };
  alert_duration: number;
  status: strategyStatus;
  append_tags: string;
  enable_stime: string;
  enable_etime: string;
  enable_days_of_week: string;
  recovery_duration: number;
  recovery_notify: notifyType;
  priority: strategyPriority;
  notify_channels: string;
  notify_groups: string;
  notify_users: string;
  callbacks: string;
  runbook_url: string;
  note: string;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}

export enum strategyFrom {
  Favorite,
  Common,
}

export type strategyGroup = {
  favorite: Array<strategyGroupItem>;
  common: Array<strategyGroupItem>;
};

export type strategyGroupItemBase = {
  name: string;
  user_group_ids: string;
  user_groups: Array<strategyGroupItem>;
};

export type strategyGroupItem = baseFavoriteItem & {
  name: string;
};

export interface warningStoreState {
  group: favoriteGroup;
  currentGroup: strategyGroupItem | null;
}
