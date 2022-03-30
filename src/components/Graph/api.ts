import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import queryString from 'query-string';

const signals = {};

export const fetchHistory = (params?, signalKey?) => {
  const controller = new AbortController();
  const { signal } = controller;
  if (signalKey && signals[signalKey] && signals[signalKey].abort) {
    signals[signalKey].abort();
  }
  signals[signalKey] = controller;
  return request(`/api/n9e/prometheus/api/v1/query_range`, {
    method: RequestMethod.Get,
    params,
    signal,
  }).finally(() => {
    delete signals[signalKey];
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
