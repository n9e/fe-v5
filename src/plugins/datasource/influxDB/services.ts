import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { InfluxDBBaseParams, InfluxDBMeasureParams, InfluxDBTagFieldParams, InfluxDBQueryParams, InfluxDBQueryResult } from './types';

export const getInfluxdbDBs = (data: InfluxDBBaseParams): Promise<string[]> => {
  return request('/api/n9e-plus/influxdb-dbs', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getInfluxdbMeasures = (data: InfluxDBMeasureParams): Promise<string[]> => {
  return request('/api/n9e-plus/influxdb-measures', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getInfluxdbTagfields = (data: InfluxDBTagFieldParams): Promise<{ fields: string[]; tags: string[] }> => {
  return request('/api/n9e-plus/influxdb-tagfields', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getInfluxdbQuery = (data: InfluxDBQueryParams): Promise<InfluxDBQueryResult[]> => {
  return request('/api/n9e-plus/ds-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

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
