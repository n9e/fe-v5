import React from 'react';
import LogSourceForm from '@/components/DataSource/LogSource/Form';
import ElasticSearch from '@/components/DataSource/LogSource/Form/ElasticSearch';
import AliyunSLS from '@/components/DataSource/LogSource/Form/AliyunSLS';

export default function index() {
  return (
    <LogSourceForm
      backUrl='/help/source'
      renderContent={(type, data, onFinish, submitLoading) => {
        switch (type) {
          case 'elasticsearch':
            return <ElasticSearch initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;
          case 'aliyun-sls':
            return <AliyunSLS initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;
          default:
            return <div>无效的数据源类型：{type}</div>;
        }
      }}
    />
  );
}
