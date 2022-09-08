import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import _ from 'lodash';

interface IItem {
  id: number;
  type: string;
  name: string;
  status: 'enabled';
}
interface IResult {
  total: number;
  list: IItem[];
}

export interface IDataSourceList {
  p: number;
  limit: number;
  category?: string;
  orderby?: string; // 排序 默认值created_at,可以按updated_at、status、name、plugin_type排序
  asc?: boolean; // 是否升序 true为升序
  plugin_type?: string;
  status?: string;
  name?: string;
}

let apiPrefix = '/api/n9e-plus/datasource';

if (import.meta.env.VITE_IS_DS_SETTING === 'true') {
  apiPrefix = '/api/v1/datasource';
}

export const getDataSourcePluginList = (data): Promise<IResult> => {
  return request(`${apiPrefix}/plugin/list`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.data.items || res.data);
};

export const getDataSourceList = (data: IDataSourceList) => {
  return request(`${apiPrefix}/list`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.data);
};

export const getDataSourceDetailById = (id: string | number) => {
  return request(`${apiPrefix}/desc`, {
    method: RequestMethod.Post,
    data: { id: Number(id) },
  }).then((res) => res.data);
};

export const submitRequest = (body) => {
  return request(`${apiPrefix}/upsert`, {
    method: RequestMethod.Post,
    data: body,
  }).then((res) => res.data);
};

export const updateDataSourceStatus = (body: { id: number; status: 'enabled' | 'disabled' }) => {
  return request(`${apiPrefix}/status/update`, {
    method: RequestMethod.Post,
    data: body,
  }).then((res) => res.data);
};

export const deleteDataSourceById = (id: string | number) => {
  return request(`${apiPrefix}/status/update`, {
    method: RequestMethod.Post,
    data: { status: 'deleted', id },
  }).then((res) => res.data);
};
