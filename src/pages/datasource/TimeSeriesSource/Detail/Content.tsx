import React, { useState } from 'react';
import Prometheus from '@/components/DataSource/TimeSeriesSource/Detail/Prometheus';
import MYSQL from './Mysql';
import Oracle from './Oracle';
import Zabbix from './Zabbix';
import { DataSourceType } from '@/components/DataSource/TimeSeriesSource/types';
interface Props {
  data: DataSourceType;
}
export default function Content(props: Props) {
  const { data } = props;
  const { plugin_type } = data;
  const renderContent = () => {
    switch (plugin_type) {
      case 'zabbix':
        return <Zabbix data={data} />;
      case 'oracle':
        return <Oracle data={data} />;
      case 'prometheus':
        return <Prometheus data={data} />;
      case 'mysql':
        return <MYSQL data={data} />;
      default:
        return <div>无效的数据源类型：{plugin_type}</div>;
    }
  };

  return <>{renderContent()}</>;
}
