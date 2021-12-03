import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { IshieldState } from '@/store/warningInterface/shield';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';

import './index.less'

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const EditShield: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { curBusiItem } = useSelector<RootState, CommonStoreState>(state => state.common);
  const { curShieldData } = useSelector<RootState, IshieldState>(state => state.shield);
  if (!curShieldData.id) {
    history.push(`/alert-mutes`);
  }
  const query = useQuery();
  const isClone = query.get('mode');
  const params: any = useParams();
  const shieldId = useMemo(() => {
    return params.id;
  }, [params]);
  // const [curShield, setCurShield] = useState<any>({})
  // useEffect(() => {
  //   getShield();
  // }, [shieldId]);

  // const getShield = async () => {
  //   const { success, dat } = await getShieldList({ id: curBusiItem.id });
  //   setCurShield(dat || {})
  // }
  return (
    <PageLayout title={t('告警屏蔽')} showBack>
      <div className='shield-add'>
        {curShieldData.id && <OperateForm  detail={curShieldData} type={!isClone ? 1 : 2}/>}
      </div>
    </PageLayout>
  );
};

export default EditShield;
