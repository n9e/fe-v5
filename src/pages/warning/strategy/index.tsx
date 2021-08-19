import React, { useEffect, useState } from 'react';
import PageLayout from '@/components/pageLayout';
import LeftTree from '@/components/BaseLeftTree';
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
  // const [teamList, setTeamList] = useState<Array<Team>>([]);
  // useEffect(() => {
  //   getTeamInfoList().then((data) => {
  //     setTeamList(data?.dat?.list || []);
  //   });
  // }, []);
  return (
    <PageLayout title={t('告警策略')} icon={<SettingOutlined />}>
      <div className='strategy-content'>
        <LeftTree
          // pageTitle={t('告警策略')}
          typeName={t('策略分组')}
          pathKey='name'
          treeType='strategy'
        ></LeftTree>
        <PageTable></PageTable>
      </div>
    </PageLayout>
  );
};

export default Strategy;
