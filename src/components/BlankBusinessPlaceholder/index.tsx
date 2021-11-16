import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
interface Props {
  text: string;
}
export default function BlankBusinessPlaceholder(props: Props) {
  const { t } = useTranslation();
  const { text } = props;

  return (
    <div className='blank-busi-holder'>
      {text}需要归属某个业务组，请先
      <Link to='/manage/business'>创建业务组</Link>
    </div>
  );
}
