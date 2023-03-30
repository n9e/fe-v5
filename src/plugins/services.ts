import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getDBQuery<T>(data: T): Promise<
  {
    metric: {
      [index: string]: string;
    };
    values: Array<[number, number]>;
  }[]
> {
  return request('/api/n9e-plus/ds-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export function getLogsQuery<T>(data: T): Promise<{ list: any[]; total: number }> {
  return request('/api/n9e-plus/logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
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
