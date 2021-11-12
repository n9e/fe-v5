import React from 'react';
import PageLayout from '@/components/pageLayout';
import LeftTree from '@/components/LeftTree';
import { DatabaseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './index.less';
import BasicTable from '@/components/Dantd/components/basic-table';

const ObjectManage: React.FC = () => {
  const { t } = useTranslation();
  const columns = [
    {
      title: '集群',
      dataIndex: 'cluster',
    },
    {
      title: '标识',
      dataIndex: '1',
    },
    {
      title: '标签',
      dataIndex: '2',
    },
    {
      title: '业务组',
      dataIndex: '3',
    },
    {
      title: '备注',
      dataIndex: '4',
    },
  ];
  return (
    <PageLayout title={t('资源管理')} icon={<DatabaseOutlined />}>
      <div className='object-manage-page-content'>
        <LeftTree />
        <div className='table-area'>
          <BasicTable columns={columns} dataSource={[]} />
        </div>
      </div>
    </PageLayout>
  );
};

export default ObjectManage;
