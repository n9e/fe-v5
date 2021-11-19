import React, { useMemo, useEffect, useState } from 'react';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';
import {
  getWarningStrategy,
} from '@/services/warning';

import './index.less'
import { strategyFrom } from '@/store/warningInterface';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const StrategyEdit: React.FC = () => {
  const { t } = useTranslation();
  const query = useQuery();
  const isClone = query.get('mode');
  const params: any = useParams();
  const strategyId = useMemo(() => {
    return params.id;
  }, [params]);
  const [curStrategy, setCurStrategy] = useState<any>({})
  useEffect(() => {
    getStrategy();
    return () => {
      
    }
  }, [strategyId]);

  const getStrategy = async () => {
    const res = await getWarningStrategy(strategyId);
    setCurStrategy(res.dat || {})
  }

  return (
    <PageLayout title={t('告警规则')} showBack>
      {curStrategy.id && <OperateForm  detail={curStrategy} type={!isClone ? 1 : 2}/>}
      
    </PageLayout>
  );
};

export default StrategyEdit;
