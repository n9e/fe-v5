import React from 'react';
import LogSourceForm from '@/components/DataSource/LogSource/Form';
import ElasticSearch from '@/components/DataSource/LogSource/Form/ElasticSearch';
import AliyunSLS from '@/components/DataSource/LogSource/Form/AliyunSLS';
import { useTranslation } from "react-i18next";
export default function index() {
  const {
    t
  } = useTranslation();
  return <LogSourceForm backUrl='/help/source' renderContent={(type, data, onFinish, submitLoading) => {
    switch (type) {
      case 'elasticsearch':
        return <ElasticSearch initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;

      case 'aliyun-sls':
        return <AliyunSLS initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;

      default:
        return <div>{t("无效的数据源类型：")}{type}</div>;
    }
  }} />;
}