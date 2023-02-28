import React from 'react';
import TimeSeriesSourceForm from '@/components/DataSource/TimeSeriesSource/Form';
import Prometheus from '@/components/DataSource/TimeSeriesSource/Form/Prometheus';
import { useTranslation } from "react-i18next";
export default function index() {
  const {
    t
  } = useTranslation();
  return <TimeSeriesSourceForm backUrl='/help/source' renderContent={(type, data, onFinish, submitLoading) => {
    switch (type) {
      case 'prometheus':
        return <Prometheus initialValues={data} onFinish={onFinish} submitLoading={submitLoading} />;

      default:
        return <div>{t("无效的数据源类型：")}{type}</div>;
    }
  }} />;
}