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
import { ITimeOption, TDurationUnit } from './types';

export const spans: { [key: string]: { display: string; section?: number; displayZh: string } } = {
  s: { display: 'second', displayZh: '秒' },
  m: { display: 'minute', displayZh: '分钟' },
  h: { display: 'hour', displayZh: '小时' },
  d: { display: 'day', displayZh: '天' },
  w: { display: 'week', displayZh: '周' },
  M: { display: 'month', displayZh: '月' },
  y: { display: 'year', displayZh: '年' },
};

export const rangeOptions: ITimeOption[] = [
  { start: 'now-1m', end: 'now', display: 'Last 1 minutes', displayZh: '最近 1 分钟' },
  { start: 'now-2m', end: 'now', display: 'Last 2 minutes', displayZh: '最近 2 分钟' },
  { start: 'now-3m', end: 'now', display: 'Last 3 minutes', displayZh: '最近 3 分钟' },
  { start: 'now-5m', end: 'now', display: 'Last 5 minutes', displayZh: '最近 5 分钟' },
  { start: 'now-15m', end: 'now', display: 'Last 15 minutes', displayZh: '最近 15 分钟' },
  { start: 'now-30m', end: 'now', display: 'Last 30 minutes', displayZh: '最近 30 分钟' },
  { start: 'now-1h', end: 'now', display: 'Last 1 hour', displayZh: '最近 1 小时' },
  { start: 'now-3h', end: 'now', display: 'Last 3 hours', displayZh: '最近 3 小时' },
  { start: 'now-6h', end: 'now', display: 'Last 6 hours', displayZh: '最近 6 小时' },
  { start: 'now-12h', end: 'now', display: 'Last 12 hours', displayZh: '最近 12 小时' },
  { start: 'now-24h', end: 'now', display: 'Last 24 hours', displayZh: '最近 24 小时' },
  { start: 'now-2d', end: 'now', display: 'Last 2 days', displayZh: '最近 2 天' },
  { start: 'now-7d', end: 'now', display: 'Last 7 days', displayZh: '最近 7 天' },
  { start: 'now-30d', end: 'now', display: 'Last 30 days', displayZh: '最近 30 天' },
  { start: 'now-90d', end: 'now', display: 'Last 90 days', displayZh: '最近 90 天' },
  { start: 'now-1d/d', end: 'now-1d/d', display: 'Yesterday', displayZh: '昨天' },
  {
    start: 'now-2d/d',
    end: 'now-2d/d',
    display: 'Day before yesterday',
    displayZh: '前天',
  },
  {
    start: 'now-7d/d',
    end: 'now-7d/d',
    display: 'This day last week',
    displayZh: '上周今天',
  },
  { start: 'now-1w/w', end: 'now-1w/w', display: 'Previous week', displayZh: '上周' },
  { start: 'now-1M/M', end: 'now-1M/M', display: 'Previous month', displayZh: '上个月' },
  { start: 'now/d', end: 'now/d', display: 'Today', displayZh: '今天' },
  { start: 'now/d', end: 'now', display: 'Today so far', displayZh: '今天到现在' },
  { start: 'now/w', end: 'now/w', display: 'This week', displayZh: '本周' },
  { start: 'now/w', end: 'now', display: 'This week so far', displayZh: '本周到现在' },
  { start: 'now/M', end: 'now/M', display: 'This month', displayZh: '本月' },
  { start: 'now/M', end: 'now', display: 'This month so far', displayZh: '本月到现在' },
];

export const momentLocaleZhCN = {
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
  weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
  weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
};

export const units: TDurationUnit[] = ['y', 'M', 'w', 'd', 'h', 'm', 's', 'Q'];
