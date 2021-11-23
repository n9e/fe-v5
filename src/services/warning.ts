import request from '@/utils/request';
import { RequestMethod, IBasePagingParams } from '@/store/common';
import type {
  MetricListRes,
  strategyGroup,
  strategyStatus,
  TagKeysRes,
  TagValuesRes,
} from '@/store/warningInterface';
import { PAGE_SIZE } from '@/utils/constant';
import React from 'react';

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
export const updateStrategyGroup = function (
  data: Partial<strategyGroup> & { id: number },
) {
  return request(`/api/n9e/alert-rule-group/${data.id}`, {
    method: RequestMethod.Put,
    data,
  });
};

//// 获取策略列表
export const getStrategyGroupSubList = function (
  params: { id: number },
) {
  return request(
    `/api/n9e/busi-group/${params.id}/alert-rules`,
    {
      method: RequestMethod.Get,
    },
  );
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

export const deleteStrategy = function (ids: number[],  strategyId: number) {
  return request(`/api/n9e/busi-group/${strategyId}/alert-rules`, {
    method: RequestMethod.Delete,
    data: { ids }
  });
};

export const batchDeleteStrategy = function (ruleId, ids: Array<number>) {
  return request(`/api/n9e/alert-rule-group/${ruleId}/alert-rules`, {
    method: RequestMethod.Delete,
    data: { ids },
  });
};

export const prometheusQuery = function (data): Promise<any> {
  return request(`/api/n9e/prometheus/api/v1/query`, {
    method: RequestMethod.Get,
    params: data,
  });
};

/**
 * 批量更新规则
 */
 export const updateAlertRules = function (
  data: {
    ids: React.Key[],
    fields: any
  },
  busiId: number
) {
  return request(`/api/n9e/busi-group/${busiId}/alert-rules/fields`, {
    method: RequestMethod.Put,
    data: data,
  });
};

/**
 * 获取未恢复告警列表
 */
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

export const getAlertEventsById = function (id) {
  return request(`/api/n9e/alert-event/${id}`, {
    method: RequestMethod.Get,
  });
};

export const getHistoryEventsById = function (id) {
  return request(`/api/n9e/history-alert-event/${id}`, {
    method: RequestMethod.Get,
  });
};
/**
 * 批量删除(忽略)告警历史
 */
export const deleteAlertEvents = function (ids: Array<number>) {
  return request(`/api/n9e/alert-events`, {
    method: RequestMethod.Delete,
    data: {
      ids,
    },
  });
};


/**
 * 批量更新告警策略状态
 */
export const updateAlertEventsStatus = function (
  ids: Array<number>,
  status: strategyStatus,
) {
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
export const updateAlertEventsNotifyGroups = function (
  ids: Array<number>,
  notify_groups: string,
  notify_users: string,
) {
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
export const updateAlertEventsNotifyUsers = function (
  ids: Array<number>,
  notify_users: string,
) {
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
export const updateAlertEventsNotifyChannels = function (
  ids: Array<number>,
  notify_channels: string,
) {
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
export const updateAlertEventsAppendTags = function (
  ids: Array<number>,
  append_tags: string,
) {
  return request(`/api/n9e/alert-rules/append-tags`, {
    method: RequestMethod.Put,
    data: {
      ids,
      append_tags,
    },
  });
};
