import React from 'react';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';

import './index.less';

const StrategyAdd: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('记录规则')} showBack hideCluster>
      <OperateForm />
    </PageLayout>
  );
};

export default StrategyAdd;
