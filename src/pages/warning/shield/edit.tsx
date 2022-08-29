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
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { IshieldState } from '@/store/warningInterface/shield';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';

import './index.less';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const EditShield: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { curShieldData } = useSelector<RootState, IshieldState>((state) => state.shield);
  if (!curShieldData.id) {
    history.push(`/alert-mutes`);
  }
  const query = useQuery();
  const isClone = query.get('mode');

  return (
    <PageLayout title={t('告警屏蔽')} showBack hideCluster>
      <div className='shield-add'>{curShieldData.id && <OperateForm detail={curShieldData} type={!isClone ? 1 : 2} />}</div>
    </PageLayout>
  );
};

export default EditShield;
