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

let apiPrefix = '/api/n9e-plus/datasource';

if (import.meta.env.VITE_IS_DS_SETTING === 'true') {
  apiPrefix = '/api/v1/datasource';
}

export const getDataSourcePluginList = (category: string = 'timeseries'): Promise<IResult> => {
  return request(`${apiPrefix}/plugin/list`, {
    method: RequestMethod.Post,
    data: {
      p: 1,
      limit: 100,
      category,
    },
  }).then((res) => res.data.items || res.data);
};

export const getLogSourceList = ({ current, pageSize, category }) => {
  return request(`${apiPrefix}/list`, {
    method: RequestMethod.Post,
    data: {
      p: current,
      limit: pageSize,
      category,
    },
  }).then((res) => ({
    total: res.data.total,
    list: res.data.items,
  }));
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

export const getKafkaSample = (data) => {
  return request(`/api/v1/datasource/kafka/message/sample`, {
    method: RequestMethod.Post,
    data,
  });
};

/**
 * 查询kafka消费延迟
 * @param id
 * @returns
 */
export const getKafkaLag = (id: number) => {
  return request(`/api/v1/datasource/kafka/offset/lag?id=${id}`, {
    method: RequestMethod.Get,
  });
};

/**
 * 重置kafka的消费offset至最新
 * @param data
 * @returns
 */
export const kafkaOffsetReset = (data: { id: number }) => {
  return request(`/api/v1/datasource/kafka/offset/reset`, {
    method: RequestMethod.Post,
    data,
  });
};

/**
 *
 * @returns 获取ES集群中的特殊标志位
 */
export const getDatasourceMeta = () => {
  return request(`/api/v1/dimensions/theme/datasource/meta`, {
    method: RequestMethod.Get,
  }).then((res) => res.data);
};

/**
 *
 * @param data
 * @returns 设置某个集群为日志分析的默认集群
 */
export const setDatasourceDefault = (data: { id: number }) => {
  return request(`/api/v1/dimensions/theme/datasource/default`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.data);
};
