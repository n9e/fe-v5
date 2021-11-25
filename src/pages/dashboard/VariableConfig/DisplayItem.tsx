import React, { useContext, useEffect, useState } from 'react';
import { Row, Col, Input, Select, Checkbox } from 'antd';
import { resourceGroupItem } from '@/store/businessInterface';
import { useTranslation } from 'react-i18next';
import { FormType } from './EditItem';

interface Props {
  data: FormType | undefined;
}

const DisplayItem: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className='tag-content-close-item'>
        <div className='tag-content-close-item-tagName'>aaaaa</div>
        <div>content</div>
      </div>
    </div>
  );
};

export default DisplayItem;
