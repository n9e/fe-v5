import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const getFields = function (data: any) {
  return request('/api/n9e-plus/ck-fields', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const logQuery = function (data: any) {
  return request('/api/n9e-plus/logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const dsQuery = function (data: any) {
  return request('/api/n9e-plus/ds-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getSQLPreview = function (data: any) {
  return request('/api/n9e-plus/ck-sql-preview', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};
