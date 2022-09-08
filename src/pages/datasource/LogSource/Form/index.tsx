import React from 'react';
import LogSourceForm from '@/components/DataSource/LogSource/Form';
import ElasticSearch from '@/components/DataSource/LogSource/Form/ElasticSearch';

export default function index() {
  return (
    <LogSourceForm
      backUrl='/help/source'
      renderContent={(type, data, onFinish, submitLoading) => {
        switch (type) {
          case 'elasticsearch':
            return <ElasticSearch initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;
          default:
            return <div>无效的数据源类型：{type}</div>;
        }
      }}
    />
  );
}
