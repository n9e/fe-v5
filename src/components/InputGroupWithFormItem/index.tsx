import React from 'react';
import { Input } from 'antd';
import './style.less';
interface IProps {
  children: React.ReactNode;
  label: React.ReactNode;
  labelWidth?: number;
  noStyle?: boolean;
}

export default function index(props: IProps) {
  const { children, label, labelWidth = 'max-content', noStyle = false } = props;
  return (
    <Input.Group compact className='input-group-with-form-item'>
      <span
        className={!noStyle ? 'ant-input-group-addon input-group-with-form-item-label' : 'input-group-with-form-item-label'}
        style={{
          height: 32,
          lineHeight: '32px',
          maxWidth: 'unset',
          width: labelWidth,
        }}
      >
        {label}
      </span>
      <div
        className='input-group-with-form-item-content'
        style={{
          width: `calc(100% - ${labelWidth}px)`,
        }}
      >
        {children}
      </div>
    </Input.Group>
  );
}
