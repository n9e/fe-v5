import React from 'react';
import LogSourceDetail from '@/components/DataSource/LogSource/Detail';
import ElasticSearch from '@/components/DataSource/LogSource/Detail/ElasticSearch';
import { DataSourceType } from '@/components/DataSource/LogSource/types';

interface IProps {
  data: DataSourceType;
  visible: boolean;
  onClose: () => void;
}

export default function index(props: IProps) {
  const { visible, onClose, data } = props;
  return (
    <LogSourceDetail
      visible={visible}
      onClose={onClose}
      data={data}
      editUrl='/help/source/edit/logging'
      renderContent={(data) => {
        switch (data.plugin_type) {
          case 'elasticsearch':
            return <ElasticSearch data={data} />;
          default:
            return <div>无效的数据源类型：{data.plugin_type}</div>;
        }
      }}
    />
  );
}
