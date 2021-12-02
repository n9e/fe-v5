import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import queryString from 'query-string';

export const fetchHistory = (params?) => {
  return request(`/api/n9e/prometheus/api/v1/query_range`, {
    method: RequestMethod.Get,
    params
  });
}

export const fetchAggrGroups = (params?) => {
  return request(`/api/n9e/prometheus/api/v1/labels`, {
    method: RequestMethod.Get,
    params,
    paramsSerializer: function (params) {
      return queryString.stringify(params, {arrayFormat: 'bracket'})
    },
  });
}
