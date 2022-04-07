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
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9EAPI } from '../../config/constant';
import { IndicatorParams } from '@/store/overview';

// 统计数据
export const getOver = function (data: object = {}) {
  return request(`/api/n9e/status`, {
    method: RequestMethod.Get,
    params: data,
  });
};

// 查询指标
export const getIndicator = function (data: IndicatorParams) {
  const end = Math.floor(new Date().getTime() / 1000);
  const start = end - 60 * 60;
  const res = { start, end, ...data };
  return request(`/api/n9e/query`, {
    method: RequestMethod.Post,
    data: res,
  });
};

// 指标
export const instantquery = function (data: object = {}) {
  return request(`/api/n9e/instant-query`, {
    method: RequestMethod.Post,
    data,
  });
};

// metric
export const getMetric = function (data: object) {
  return request(`/api/n9e/tag-metrics`, {
    method: RequestMethod.Post,
    data,
  });
};
