import { FormInstance } from 'antd';

export interface OracleshardType {
  'oracle.addr': string;
  'oracle.db'?: string | string[];
  'oracle.password': string;
  'oracle.user': string;
  'oracle.is_encrypt': boolean;
}

export interface OracletableType {
  'oracle.table.op': string;
  'oracle.table.source': string;
  'oracle.table.target': string;
}

export interface OracleSettingType {
  'oracle.method': string;
  'oracle.shards': OracleshardType[];
  'oracle.tables': OracletableType[];
}

export interface IFromItemBaseProps {
  namePrefix: string[];
  type: string;
  form?: FormInstance;
  max_shard?: number;
}

export interface MysqlshardBaseType {
  'mysql.addr': string;
  'mysql.password': string;
  'mysql.user': string;
  'mysql.is_encrypt': boolean;
}

export interface MysqlshardType {
  'mysql.addr': string;
  'mysql.db': string;
  'mysql.password': string;
  'mysql.user': string;
  'mysql.is_encrypt': boolean;
}

export interface MysqltableType {
  'mysql.table.op': string;
  'mysql.table.source': string;
  'mysql.table.target': string;
}

export interface MysqlSettingType {
  'mysql.method': string;
  'mysql.shards': MysqlshardType[];
  'mysql.tables': MysqltableType[];
}

export interface DataSourceType {
  id: number;
  plugin_id: number;
  name: string;
  description: string;
  status: string;
  plugin_type: string;
  plugin_type_name: string;
  settings: MysqlSettingType | PrometheusSettingType | OracleSettingType | IElasticSearchSettingType;
  created_at: number;
  updated_at: number;
  connectionStatus?: string;
}

export interface MysqlDataSourceType extends DataSourceType {
  settings: MysqlSettingType;
}

export interface PrometheusSettingType {
  'prometheus.addr': string;
  'prometheus.password': string;
  'prometheus.user': string;
}

export interface IElasticSearchSettingType {
  'es.addr': string;
  'es.version'?: string; // [7.10+]
  'es.basic'?: {
    'es.auth.enable'?: boolean;
    'es.username': string;
    'es.password': string;
  };
  'es.headers'?: {
    [key: string]: string; // map
  };
  'es.min_interval'?: Number;
  'es.timeout'?: Number;
  'es.max_shard'?: Number;
  'es.tls'?: {
    'es.tls.skip_tls_verify'?: boolean;
  };
  'es.nodes'?: string[];
}
