import React from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { SettingOutlined } from '@ant-design/icons';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { useQuery } from '@/utils';
import LeftTree from '@/components/LeftTree';
import PageTable from './PageTable';

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
