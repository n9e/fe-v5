export interface IFromItemBaseProps {
  namePrefix: string[];
  type: string;
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
  settings: MysqlSettingType | PrometheusSettingType;
  created_at: number;
  updated_at: number;
}

export interface MysqlDataSourceType extends DataSourceType {
  settings: MysqlSettingType;
}

export interface PrometheusSettingType {
  'prometheus.addr': string;
  'prometheus.password': string;
  'prometheus.user': string;
}
