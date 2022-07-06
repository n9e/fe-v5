import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/pageLayout';
import PageTable from './PageTable';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { useHistory } from 'react-router-dom';
import { useQuery } from '@/utils';
import LeftTree from '@/components/LeftTree';

const Strategy: React.FC = () => {
  const { t } = useTranslation();
  const urlQuery = useQuery();
  const history = useHistory();
  const id = urlQuery.get('id');
  const busiChange = (id) => {
    history.push(`/recording-rules?id=${id}`);
  };

  return (
    <PageLayout title={t('记录规则')} icon={<SettingOutlined />} hideCluster>
      <div className='strategy-content'>
        <LeftTree
          busiGroup={{
            defaultSelect: id ? Number(id) : undefined,
            onChange: busiChange,
          }}
        ></LeftTree>
        {id ? <PageTable bgid={Number(id)}></PageTable> : <BlankBusinessPlaceholder text='记录规则' />}
      </div>
    </PageLayout>
  );
};

export default Strategy;
