import React, { useState, ReactNode } from 'react';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { Input, Radio, Progress, Divider } from 'antd';
import './index.less';

interface Props {
  text: string;
  onClick?: Function;
}

export default function FlashCatTag(props: Props) {
  const { text, onClick } = props;
  return (
    <span className='flash-cat-tag' onClick={() => onClick && onClick()}>
      {text}
    </span>
  );
}
