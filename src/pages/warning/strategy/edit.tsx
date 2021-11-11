import React, { useMemo, useEffect } from 'react';
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
  useEffect(() => {
    getStrategy();
    return () => {
      
    }
  }, [strategyId]);

  const getStrategy = async () => {
    const res = await getWarningStrategy(strategyId);
    console.log(res, 8888888)
  }
  console.log(strategyId)
  return (
    <PageLayout title={t('告警规则')} showBack>
      <OperateForm type={isClone ? 2 : 1}/>
    </PageLayout>
  );
};

export default StrategyEdit;
