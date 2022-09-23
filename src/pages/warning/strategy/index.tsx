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
import PageLayout from '@/components/pageLayout';
import { useHistory } from 'react-router-dom';
import LeftTree from '@/components/LeftTree';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import PageTable from './PageTable';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '../index.less';
import { useQuery } from '@/utils';

const Strategy: React.FC = () => {
  const urlQuery = useQuery();
  const history = useHistory();
  const id = urlQuery.get('id');
  const { t } = useTranslation();
  const busiChange = (id) => {
    history.push(`/alert-rules?id=${id}`);
  };
  return (
    <PageLayout title={t('告警规则')} icon={<SettingOutlined />} hideCluster>
      <div className='strategy-content'>
        <LeftTree
          busiGroup={{
            defaultSelect: id ? Number(id) : undefined,
            onChange: busiChange,
          }}
        ></LeftTree>
        {id ? <PageTable bgid={Number(id)}></PageTable> : <BlankBusinessPlaceholder text='告警规则' />}
      </div>
    </PageLayout>
  );
};

export default Strategy;
