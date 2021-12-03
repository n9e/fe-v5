import React from 'react';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';
import './index.less';

const AddSubscribe: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('订阅规则')} showBack hideCluster>
      <div className='shield-add'>
        <OperateForm />
      </div>
    </PageLayout>
  );
};

export default AddSubscribe;
