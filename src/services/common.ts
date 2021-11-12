import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

// 获取集群信息
export function getCommonClusters() {
  return request(`/api/n9e/clusters`, {
    method: RequestMethod.Get,
  });
}

export function getBusiGroups(query: string, limit: number = 200) {
  return request(`/api/n9e/busi-groups`, {
    method: RequestMethod.Get,
    params: {
      query,
      limit,
    },
  });
}
