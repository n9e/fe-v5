import React from 'react';
import TimeSeriesSourceDetail from '@/components/DataSource/TimeSeriesSource/Detail';
import Prometheus from '@/components/DataSource/TimeSeriesSource/Detail/Prometheus';
import { DataSourceType } from '@/components/DataSource/TimeSeriesSource/types';

interface IProps {
  data: DataSourceType;
  visible: boolean;
  onClose: () => void;
}

export default function index(props: IProps) {
  const { visible, onClose, data } = props;
  return (
    <TimeSeriesSourceDetail
      visible={visible}
      onClose={onClose}
      data={data}
      editUrl='/help/source/edit/timeseries'
      renderContent={(data) => {
        switch (data.plugin_type) {
          case 'prometheus':
            return <Prometheus data={data} />;
          default:
            return <div>无效的数据源类型：{data.plugin_type}</div>;
        }
      }}
    />
  );
}
