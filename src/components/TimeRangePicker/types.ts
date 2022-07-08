import { Moment } from 'moment';

export type TDurationUnit =
  | 'year'
  | 'years'
  | 'y'
  | 'month'
  | 'months'
  | 'M'
  | 'week'
  | 'weeks'
  | 'isoWeek'
  | 'w'
  | 'day'
  | 'days'
  | 'd'
  | 'hour'
  | 'hours'
  | 'h'
  | 'minute'
  | 'minutes'
  | 'm'
  | 'second'
  | 'seconds'
  | 's'
  | 'millisecond'
  | 'milliseconds'
  | 'ms'
  | 'quarter'
  | 'quarters'
  | 'Q';

export interface ITimeOption {
  start: string;
  end: string;
  display: string;
  displayZh: string;
}

export interface IRawTimeRange {
  start: string | Moment;
  end: string | Moment;
  refreshFlag?: string; // 用于自动刷新场景
}
