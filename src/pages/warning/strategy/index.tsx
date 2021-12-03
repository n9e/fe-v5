import React, { useState } from 'react';
import PageLayout from '@/components/pageLayout';
import LeftTree from '@/components/LeftTree';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import PageTable from './PageTable';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '../index.less';

const Strategy: React.FC = () => {
  const { t } = useTranslation();
  const [bgid, setBgid] = useState(undefined);
  const [clusters, setClusters] = useState([]);

  const clusterChange = (data) => {
    setClusters(data);
  };
  const busiChange = (data) => {
    setBgid(data);
  };
  return (
    <PageLayout title={t('告警规则')} icon={<SettingOutlined />} hideCluster>
      <div className='strategy-content'>
        <LeftTree
          clusterGroup={{
            isShow: true,
            onChange: clusterChange,
          }}
          busiGroup={{
            onChange: busiChange,
          }}
        ></LeftTree>
        {bgid ? <PageTable bgid={bgid} clusters={clusters}></PageTable> : <BlankBusinessPlaceholder text='告警规则' />}
      </div>
    </PageLayout>
  );
};

export default Strategy;
