import React from 'react';
import PageLayout from '@/components/pageLayout';
import LeftTree from '@/components/BaseLeftTree';
import PageTable from './component/PageTable';
import FormButtonModal from '@/components/BaseModal/formButtonModal';
import { createResourceGroupModal } from './component/constant';
import './index.less';
import { DatabaseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const Resource: React.FC = () => {
  const { t } = useTranslation();
  return (
    // <PageLayout
    //   icon={<DatabaseOutlined />}
    //   title={'资源管理'}
    //   // rightArea={
    //   //   <FormButtonModal {...createResourceGroupModal()}></FormButtonModal>
    //   // }
    // >
    <div className='resource-content'>
      <LeftTree pageTitle={t('资源管理')} typeName={t('资源分组')}></LeftTree>
      <PageTable></PageTable>
    </div> // </PageLayout>
  );
};

export default Resource;
