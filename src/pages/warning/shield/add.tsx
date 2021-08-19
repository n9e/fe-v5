import React from 'react';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';

const AddShield: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('新建告警屏蔽')} showBack>
      <OperateForm />
    </PageLayout>
  );
};

export default AddShield;
