import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { RSAEncrypt } from '@/utils';
import _ from 'lodash';
import { MysqlshardType, MysqlshardBaseType, MysqltableType } from './types';
import { OracleshardType, OracletableType } from '../../../Packages/Settings/pages/TimeSeriesSource/Form/Oracle/types';
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
  category: string;
  orderby?: string; // 排序 默认值created_at,可以按updated_at、status、name、plugin_type排序
  asc?: boolean; // 是否升序 true为升序
  plugin_type?: string;
  status?: string;
  name?: string;
}

export const apiPrefix = '/api/v1/datasource';

export function shardRSAEncrypt(data: MysqlshardBaseType | OracleshardType, type: string) {
  const cloned = _.cloneDeep(data);
  if (cloned[`${type}.is_encrypt`] === false) {
    cloned[`${type}.password`] = RSAEncrypt(cloned[`${type}.password`]);
    cloned[`${type}.is_encrypt`] = true;
  }
  return cloned;
}

export const getDataSourcePluginList = (data): Promise<IResult> => {
  return request(`${apiPrefix}/plugin/list`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.data.items);
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

export const mysqlConnTest = (body: MysqlshardBaseType) => {
  return request(`${apiPrefix}/mysql/conn/test`, {
    method: RequestMethod.Post,
    data: shardRSAEncrypt(body, 'mysql'),
    silence: true,
  }).then((res) => _.get(res.data, 'test', { success: false, message: '连接测试失败' }));
};

export const deleteDataSourceById = (id: string | number) => {
  return request(`${apiPrefix}/status/update`, {
    method: RequestMethod.Post,
    data: { status: 'deleted', id },
  }).then((res) => res.data);
};

export const getMySqlDBs = (body: MysqlshardBaseType) => {
  return request(`${apiPrefix}/mysql/dbs/show`, {
    method: RequestMethod.Post,
    data: shardRSAEncrypt(body, 'mysql'),
    silence: true,
  }).then((res) => res.data?.items);
};

export const getTablesSuggestion = (body: { 'mysql.shards': MysqlshardType[]; keyword?: string }) => {
  return request(`${apiPrefix}/mysql/tables/show`, {
    method: RequestMethod.Post,
    data: {
      ...body,
      'mysql.shards': _.map(body['mysql.shards'], (el) => shardRSAEncrypt(el, 'mysql')),
    },
  });
};

export const getMatchTables = (body: { 'mysql.shards': MysqlshardType[]; 'mysql.table.op': string; 'mysql.table.source': string }) => {
  return request(`${apiPrefix}/mysql/tables/match`, {
    method: RequestMethod.Post,
    data: {
      ...body,
      'mysql.shards': _.map(body['mysql.shards'], (el) => shardRSAEncrypt(el, 'mysql')),
    },
  });
};

export const checkTableFormat = (body: { 'mysql.shards': MysqlshardType[]; 'mysql.tables': MysqltableType[] }) => {
  return request(`${apiPrefix}/mysql/tables/diff/check`, {
    method: RequestMethod.Post,
    data: {
      ...body,
      'mysql.shards': _.map(body['mysql.shards'], (el) => shardRSAEncrypt(el, 'mysql')),
    },
  });
};

export const oracleConnTest = (body: OracleshardType) => {
  return request(`${apiPrefix}/oracle/conn/test`, {
    method: RequestMethod.Post,
    data: shardRSAEncrypt(body, 'oracle'),
    silence: true,
  }).then((res) => _.get(res.data, 'test', { success: false, message: '连接测试失败' }));
};

export const getOracleDBs = (body: OracleshardType) => {
  return request(`${apiPrefix}/oracle/dbs/show`, {
    method: RequestMethod.Post,
    data: shardRSAEncrypt(body, 'oracle'),
    silence: true,
  }).then((res) => res.data?.items);
};

export const getOralceTablesSuggestion = (body: { 'oracle.shards': OracleshardType[]; keyword?: string }) => {
  return request(`${apiPrefix}/oracle/tables/show`, {
    method: RequestMethod.Post,
    data: {
      ...body,
      'oralce.shards': _.map(body['oralce.shards'], shardRSAEncrypt),
    },
  });
};

export const geOracletMatchTables = (body: { 'oracle.shards': OracleshardType[]; 'oracle.table.op': string; 'oracle.table.source': string }) => {
  return request(`${apiPrefix}/oracle/tables/match`, {
    method: RequestMethod.Post,
    data: {
      ...body,
      'oracle.shards': _.map(body['oracle.shards'], shardRSAEncrypt),
    },
  });
};

export const oracleCheckTableFormat = (body: { 'oracle.shards': OracleshardType[]; 'oracle.tables': OracletableType[] }) => {
  return request(`${apiPrefix}/oracle/tables/diff/check`, {
    method: RequestMethod.Post,
    data: {
      ...body,
      'oracle.shards': _.map(body['oracle.shards'], shardRSAEncrypt),
    },
  });
};
