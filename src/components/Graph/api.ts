import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const fetchHistory = (params?) => {
  return request(`/api/n9e/prometheus/api/v1/query_range`, {
    method: RequestMethod.Get,
    params
  });
}

export const fetchAggrGroups = (params?) => {
  return request(`/api/n9e/prometheus/api/v1/labels`, {
    method: RequestMethod.Get,
    params
  });
}
