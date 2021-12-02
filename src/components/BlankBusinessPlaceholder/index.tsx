import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { InfoCircleOutlined } from '@ant-design/icons';
interface Props {
  text: string;
}
export default function BlankBusinessPlaceholder(props: Props) {
  const { t } = useTranslation();
  const { text } = props;

  return (
    <div className='blank-busi-holder'>
      <p style={{ textAlign: 'left', fontWeight: 'bold' }}>
        <InfoCircleOutlined style={{ color: '#1473ff' }} /> {t('提示信息')}
      </p>
      <p>
        {text}需要归属某个业务组，请先
        <Link to='/busi-groups'>创建业务组</Link>
      </p>
    </div>
  );
}
