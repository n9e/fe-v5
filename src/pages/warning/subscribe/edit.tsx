import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { subscribeItem } from '@/store/warningInterface/subscribe';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';
import { getSubscribeData } from '@/services/subscribe';

import './index.less';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const EditSubscribe: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [curSubscribeData, setCurSubscribeData] = useState<subscribeItem>();
  const query = useQuery();
  const isClone = query.get('mode');
  const params: any = useParams();
  const shieldId = useMemo(() => {
    return params.id;
  }, [params]);

  useEffect(() => {
    getSubscribe();
  }, [shieldId]);

  const getSubscribe = async () => {
    const { dat } = await getSubscribeData(shieldId);
    const tags = dat.tags.map((item) => {
      return {
        ...item,
        value: item.func === 'in' ? item.value.split(' ') : item.value,
      };
    });
    setCurSubscribeData(
      {
        ...dat,
        tags,
      } || {},
    );
  };

  return (
    <PageLayout title={t('订阅规则')} showBack>
      <div className='shield-add'>{curSubscribeData?.id && <OperateForm detail={curSubscribeData} type={!isClone ? 1 : 2} />}</div>
    </PageLayout>
  );
};

export default EditSubscribe;
