import React, {useState} from 'react';
import { useLocation } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import OperateForm from './components/operateForm';
import { useTranslation } from 'react-i18next';
import './index.less';

const AddShield: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [tags, setTags] = useState<any>(location.state);

  return (
    <PageLayout title={t('告警屏蔽')} showBack hideCluster>
      <div className='shield-add'>
        <OperateForm tagsObj={tags ? tags : undefined}/>
      </div>
    </PageLayout>
  );
};

export default AddShield;
