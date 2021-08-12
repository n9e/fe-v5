import React from 'react';
import { Tabs } from 'antd';
import ChangePassword from './changePassword';
import Info from './info';
import SecretKey from './secretKey';
import './profile.css';
import PageLayout from '@/components/pageLayout';
import { useParams, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const { TabPane } = Tabs;
interface Param {
  tab: string;
}
export default function Profile() {
  const { t } = useTranslation();
  const { tab } = useParams<Param>();
  const history = useHistory();

  const handleChange = (tab) => {
    history.push('/account/profile/' + tab);
  };

  return (
    <PageLayout title={t('个人中心')}>
      <Tabs activeKey={tab} className='profile' onChange={handleChange}>
        <TabPane tab={t('personalInfo')} key='info'>
          <Info />
        </TabPane>
        <TabPane tab={t('修改密码')} key='pwd'>
          <ChangePassword />
        </TabPane>
        <TabPane tab={t('秘钥管理')} key='secret'>
          <SecretKey />
        </TabPane>
      </Tabs>
    </PageLayout>
  );
}
