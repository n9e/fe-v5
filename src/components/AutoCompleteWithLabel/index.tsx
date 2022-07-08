import React, { useState, ReactNode } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, InputProps } from 'antd';
import './index.less';

interface Props {
  label: string | ReactNode;
  children: ReactNode;
}

export default function AutoCompleteWithLabel(props: Props) {
  const { label, children } = props;
  return (
    <div className='autocomplete-with-label'>
      <span className='autocomplete-with-label-label'>{label}</span>
      <div className='autocomplete-with-label-content'>{children}</div>
    </div>
  );
}
