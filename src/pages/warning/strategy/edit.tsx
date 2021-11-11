import React from 'react';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';

import './index.less'

const StrategyEdit: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('告警规则')} showBack>
      <OperateForm type={1}/>
    </PageLayout>
  );
};

export default StrategyEdit;
