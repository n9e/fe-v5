/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react';
import { Tabs } from 'antd';
import ChangePassword from './changePassword';
import Info from './info';
import SecretKey from './secretKey';
import './profile.less';
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
    history.push(import.meta.env.VITE_PREFIX + '/account/profile/' + tab);
  };

  return (
    <PageLayout title={t('个人中心')} hideCluster>
      <Tabs activeKey={tab} className='profile' onChange={handleChange}>
        <TabPane tab={t('personalInfo')} key='info'>
          <Info />
        </TabPane>
        <TabPane tab={t('修改密码')} key='pwd'>
          <ChangePassword />
        </TabPane>
        {/* <TabPane tab={t('秘钥管理')} key='secret'>
          <SecretKey />
        </TabPane> */}
      </Tabs>
    </PageLayout>
  );
}
