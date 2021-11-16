import React, { useEffect, useState } from 'react';
import PageLayout from '@/components/pageLayout';
import LeftTree from '@/components/LeftTree';
import PageTable from './PageTable';
import FormButtonModal from '@/components/BaseModal/formButtonModal';
import { getTeamInfoList } from '@/services/manage';
import { Team } from '@/store/manageInterface';
import { createGroupModel } from './constant';
import '../index.less';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const Strategy: React.FC = () => {
  const { t } = useTranslation();
  const [bgid, setBgid] = useState(undefined);
  const [clusters, setClusters] = useState([]);
  // const [teamList, setTeamList] = useState<Array<Team>>([]);
  // useEffect(() => {
  //   getTeamInfoList().then((data) => {
  //     setTeamList(data?.dat?.list || []);
  //   });
  // }, []);
  const clusterChange = (data) => {
    console.log(data)
    setClusters(data);
  }
  const busiChange = (data) => {
    console.log(data)
    setBgid(data);
  }
  return (
    <PageLayout title={t('告警规则')} icon={<SettingOutlined />}>
      <div className='strategy-content'>
        <LeftTree
          clusterGroup={{
            isShow: true,
            onChange: clusterChange
          }}
          busiGroup={{
            // showNotGroupItem: true,
            onChange: busiChange,
          }}
        ></LeftTree>
        <PageTable bgid={bgid} clusters={clusters}></PageTable>
      </div>
    </PageLayout>
  );
};

export default Strategy;
