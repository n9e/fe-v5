import React from 'react';
import TimeSeriesSourceForm from '@/components/DataSource/TimeSeriesSource/Form';
import Prometheus from '@/components/DataSource/TimeSeriesSource/Form/Prometheus';

export default function index() {
  return (
    <TimeSeriesSourceForm
      backUrl='/help/source'
      renderContent={(type, data, onFinish, submitLoading) => {
        switch (type) {
          case 'prometheus':
            return <Prometheus initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;
          default:
            return <div>无效的数据源类型：{type}</div>;
        }
      }}
    />
  );
}
