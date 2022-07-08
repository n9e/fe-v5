import React, { useState, ReactNode } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Radio, RadioChangeEvent } from 'antd';
import './index.less';

interface Props {
  onChange: (e: RadioChangeEvent) => void;
  children: ReactNode;
  value?: any;
}

export default function RadioButtons(props: Props) {
  const { onChange, children, value } = props;
  return (
    <div className='radio-button fc'>
      <Radio.Group onChange={onChange} value={value} buttonStyle='solid' style={{ height: 28 }}>
        {children}
      </Radio.Group>
    </div>
  );
}
