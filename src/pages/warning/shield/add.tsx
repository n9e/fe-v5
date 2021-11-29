import React from 'react';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';
import './index.less';

const AddShield: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('告警屏蔽')} showBack>
      <div className='shield-add'>
      <OperateForm />
      </div>
    </PageLayout>
  );
};

export default AddShield;
