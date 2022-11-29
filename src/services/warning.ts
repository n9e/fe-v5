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
import { RequestMethod, IBasePagingParams } from '@/store/common';
import type { MetricListRes, strategyGroup, strategyStatus, TagKeysRes, TagValuesRes } from '@/store/warningInterface';
import { PAGE_SIZE } from '@/utils/constant';
import React from 'react';
import queryString from 'query-string';

// 获得策略分组列表
export const getStrategyGroupList = function (query?: string, p = 1) {
  return request(`/api/n9e/alert-rule-groups`, {
    method: RequestMethod.Get,
    params: {
      query,
      p,
      limit: PAGE_SIZE,
    },
  });
};

// 添加策略分组
export const addStrategyGroup = function (data: strategyGroup) {
  return request(`/api/n9e/alert-rule-groups`, {
    method: RequestMethod.Post,
    data,
  });
};

// 获取策略分组
export const getStrategyGroup = function (id: number) {
  return request(`/api/n9e/alert-rule-group/${id}`, {
    method: RequestMethod.Get,
  });
};

// 删除策略分组
export const deleteStrategyGroup = function (id: number) {
  return request(`/api/n9e/alert-rule-group/${id}`, {
    method: RequestMethod.Delete,
  });
};

// 更新策略分组
export const updateStrategyGroup = function (data: Partial<strategyGroup> & { id: number }) {
  return request(`/api/n9e/alert-rule-group/${data.id}`, {
    method: RequestMethod.Put,
    data,
  });
};

//// 获取策略列表
export const getStrategyGroupSubList = function (params: { id: number }) {
  return request(`/api/n9e/busi-group/${params.id}/alert-rules`, {
    method: RequestMethod.Get,
  });
};

// 获取收藏分组
export const getFavoritesStrategyGroups = function () {
  return request(`/api/n9e/alert-rule-groups/favorites`, {
    method: RequestMethod.Get,
  });
};

// 添加收藏分组
export const addFavoriteGroup = function (id: number) {
  return request(`/api/n9e/alert-rule-group/${id}/favorites`, {
    method: RequestMethod.Post,
    data: {
      id,
    },
  });
};

// 删除收藏分组
export const deleteFavoriteGroup = function (id: number) {
  return request(`/api/n9e/alert-rule-group/${id}/favorites`, {
    method: RequestMethod.Delete,
    data: {
      id,
    },
  });
};

export const getMetrics = function (params = {}) {
  return request(`/api/n9e/prometheus/api/v1/label/__name__/values`, {
    method: RequestMethod.Get,
    params,
    paramsSerializer: function (params) {
      return queryString.stringify(params, { arrayFormat: 'bracket' });
    },
  });
};

export const getMetricsDesc = function (data = []) {
  return request(`/api/n9e/metrics/desc`, {
    method: RequestMethod.Post,
    data,
  });
};

export const getTagKeys = function (params): Promise<TagKeysRes> {
  return request(`/api/n9e/tag-keys`, {
    method: RequestMethod.Post,
    data: params,
  });
};

export const getTagValuesByKey = function (params): Promise<TagValuesRes> {
  return request(`/api/n9e/tag-values`, {
    method: RequestMethod.Post,
    data: params,
  });
};

export const getWarningStrategy = function (id): Promise<any> {
  return request(`/api/n9e/alert-rule/${id}`, {
    method: RequestMethod.Get,
  });
};

// export const addOrEditStrategy = function (data: object, strategyId?: string) {
//   let url = `/api/n9e/alert-rules`;
//   if (strategyId) url = `/api/n9e/alert-rule/${strategyId}`;
//   return request(url, {
//     method: strategyId ? RequestMethod.Put : RequestMethod.Post,
//     data: strategyId ? data[0] : data,
//   });
// };

export const addOrEditStrategy = function (data: any[], busiId: number, method: string) {
  return request(`/api/n9e/busi-group/${busiId}/alert-rules`, {
    method: method,
    data: data,
  });
};
export const EditStrategy = function (data: any[], busiId: number, strategyId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-rule/${strategyId}`, {
    method: RequestMethod.Put,
    data: data,
  });
};

export const deleteStrategy = function (ids: number[], strategyId: number) {
  return request(`/api/n9e/busi-group/${strategyId}/alert-rules`, {
    method: RequestMethod.Delete,
    data: { ids },
  });
};

export const batchDeleteStrategy = function (ruleId, ids: Array<number>) {
  return request(`/api/n9e/alert-rule-group/${ruleId}/alert-rules`, {
    method: RequestMethod.Delete,
    data: { ids },
  });
};

export const prometheusQuery = function (data, cluster): Promise<any> {
  return request(`/api/n9e/prometheus/api/v1/query`, {
    method: RequestMethod.Get,
    params: data,
    headers: {
      'X-Cluster': cluster,
    },
  });
};

/**
 * 批量更新规则
 */
export const updateAlertRules = function (
  data: {
    ids: React.Key[];
    fields: any;
    action?: string;
  },
  busiId: number,
) {
  return request(`/api/n9e/busi-group/${busiId}/alert-rules/fields`, {
    method: RequestMethod.Put,
    data: data,
  });
};

/**
 * 获取未恢复告警列表
 */
export function getBusiGroupsCurAlerts(ids: number[]) {
  return request(`/api/n9e/busi-groups/alertings`, {
    method: RequestMethod.Get,
    params: { ids: ids.join(',') },
  });
}

export const getAlertEvents = function (data) {
  return request(`/api/n9e/alert-events`, {
    method: RequestMethod.Get,
    params: data,
  });
};
/**
 * 获取全量告警历史页面
 */
export const getHistoryEvents = function (data) {
  console.log(data);

  return request(`/api/n9e/history-alert-events`, {
    method: RequestMethod.Get,
    params: data,
  });
};
// 获取告警详情
export function getAlertEventsById(busiId, eventId) {
  return request(`/api/n9e/alert-cur-event/${eventId}`, {
    method: RequestMethod.Get,
  });
}

export function getHistoryEventsById(busiId, eventId) {
  return request(`/api/n9e/alert-his-event/${eventId}`, {
    method: RequestMethod.Get,
  });
}
/**
 * 批量删除(忽略)告警历史
 */
export const deleteAlertEvents = function (busiId, ids: Array<number | string>) {
  return request(`/api/n9e/alert-cur-events`, {
    method: RequestMethod.Delete,
    data: {
      ids,
    },
  });
};

/**
 * 批量更新告警策略状态
 */
export const updateAlertEventsStatus = function (ids: Array<number>, status: strategyStatus) {
  return request(`/api/n9e/alert-rules/status`, {
    method: RequestMethod.Put,
    data: {
      ids,
      status,
    },
  });
};
/**
 * 批量更新告警通知接收组+接收人
 */
export const updateAlertEventsNotifyGroups = function (ids: Array<number>, notify_groups: string, notify_users: string) {
  return request(`/api/n9e/alert-rules/notify-groups`, {
    method: RequestMethod.Put,
    data: {
      ids,
      notify_groups,
      notify_users,
    },
  });
};
/**
 * 批量更新告警通知接收人
 */
export const updateAlertEventsNotifyUsers = function (ids: Array<number>, notify_users: string) {
  return request(`/api/n9e/alert-rules/notify-users`, {
    method: RequestMethod.Put,
    data: {
      ids,
      notify_users,
    },
  });
};
/**
 * 批量更新告警通知媒介
 */
export const updateAlertEventsNotifyChannels = function (ids: Array<number>, notify_channels: string) {
  return request(`/api/n9e/alert-rules/notify-channels`, {
    method: RequestMethod.Put,
    data: {
      ids,
      notify_channels,
    },
  });
};
/**
 * 批量更新告警附加标签
 */
export const updateAlertEventsAppendTags = function (ids: Array<number>, append_tags: string) {
  return request(`/api/n9e/alert-rules/append-tags`, {
    method: RequestMethod.Put,
    data: {
      ids,
      append_tags,
    },
  });
};

export const getBuiltinAlerts = function () {
  return request('/api/n9e/alert-rules/builtin/list', {
    method: RequestMethod.Get,
  });
};

export const createBuiltinAlerts = function (name: string, cluster: string, id: number) {
  return request(`/api/n9e/busi-group/${id}/alert-rules/builtin`, {
    method: RequestMethod.Post,
    data: { name, cluster },
  });
};

export const getAggrAlerts = function () {
  return request('/api/n9e/alert-aggr-views', {
    method: RequestMethod.Get,
  });
};

export const AddAggrAlerts = function (data) {
  return request('/api/n9e/alert-aggr-views', {
    method: RequestMethod.Post,
    data,
  });
};

export const updateAggrAlerts = function (data) {
  return request('/api/n9e/alert-aggr-views', {
    method: RequestMethod.Put,
    data,
  });
};

export const deleteAggrAlerts = function (ids: number[]) {
  return request('/api/n9e/alert-aggr-views', {
    method: RequestMethod.Delete,
    data: { ids },
  });
};

export const getAlertCards = function (params) {
  return request('/api/n9e/alert-cur-events/card', {
    method: RequestMethod.Get,
    params,
  });
};

export const getCardDetail = function (ids) {
  return request('/api/n9e/alert-cur-events/card/details', {
    method: RequestMethod.Post,
    data: { ids },
  });
};

export const getBrainData = function (params) {
  return request('/api/fc-brain/data', {
    method: RequestMethod.Get,
    params,
  });
};

export const getBrainParams = function () {
  return request('/api/fc-brain/params', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.data;
  });
};

export const checkBrainPromql = function (data) {
  return request('/api/fc-brain/promql-check', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => {
    return res.data;
  });
};

export const getBrainJobs = function (id) {
  return request('/api/fc-brain/jobs', {
    method: RequestMethod.Get,
    params: {
      id,
    },
  }).then((res) => {
    return res.data;
  });
};

export function getBrainLicense() {
  return request('/api/fc-brain/license', {
    method: RequestMethod.Get,
    silence: true,
  });
}

export function getDsQuery(params) {
  return request('/api/n9e-plus/ds-query', {
    method: RequestMethod.Post,
    data: params,
    headers: {
      'X-Cluster': 'Default',
    },
    silence: true,
  });
}

export function getLogQuery(params) {
  return request('/api/n9e-plus/log-query', {
    method: RequestMethod.Post,
    data: params,
    headers: {
      'X-Cluster': 'Default',
    },
    silence: true,
  });
}

export function getIndices(params) {
  return request('/api/n9e-plus/indices', {
    method: RequestMethod.Post,
    data: params,
    headers: {
      'X-Cluster': 'Default',
    },
  });
}

export function getFields(params) {
  return request('/api/n9e-plus/fields', {
    method: RequestMethod.Post,
    data: params,
    headers: {
      'X-Cluster': 'Default',
    },
    silence: true,
  });
}

export function getEventTSQuery(params) {
  return request('/api/n9e-plus/event-ts-query', {
    method: RequestMethod.Post,
    data: params,
  });
}

export function getEventLogQuery(params) {
  return request('/api/n9e-plus/event-log-query', {
    method: RequestMethod.Post,
    data: params,
  });
}

export function getLogsQuery(params) {
  return request('/api/n9e-plus/logs-query', {
    method: RequestMethod.Post,
    data: params,
  });
}
