import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { viewShield } from '@/services/shield';
import { shieldItem, FormType } from '@/store/warningInterface';
import PageLayout from '@/components/pageLayout';
import { Card, Spin } from 'antd';
import OperateForm from '@/pages/warning/shield/components/operateForm';
import { useTranslation } from 'react-i18next';

const ShieldDetail: React.FC = () => {
  const { t } = useTranslation();
  const params =
    useParams<{
      id: string;
    }>();
  const [detail, setDetail] = useState<shieldItem>({} as shieldItem);
  const [loading, setLoading] = useState(false);

  const getDetail = async (id: string) => {
    setLoading(true);
    const { dat, error } = await viewShield(id);
    setDetail(dat);
    setLoading(false);
  };

  useEffect(() => {
    getDetail(params.id);
  }, [params.id]);
  const content = !loading ? (
    <OperateForm detail={detail} type={FormType.edit} />
  ) : (
    <Card
      style={{
        height: 300,
        textAlign: 'center',
        lineHeight: '300px',
      }}
    >
      <Spin />
    </Card>
  );
  return (
    <PageLayout title={t('告警策略详情')} showBack>
      <Card
        style={{
          background: '#eee',
        }}
      >
        {content}
      </Card>
    </PageLayout>
  );
};

export default ShieldDetail;
