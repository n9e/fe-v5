import React from 'react';
import { Input } from 'antd';

interface IProps {
  children: React.ReactNode;
  label: React.ReactNode;
  labelWidth?: number;
  noStyle?: boolean;
}

export default function index(props: IProps) {
  const { children, label, labelWidth = 60, noStyle = false } = props;
  return (
    <Input.Group compact>
      <span
        className={!noStyle ? 'ant-input-group-addon' : ''}
        style={{
          height: 32,
          lineHeight: '32px',
          width: labelWidth,
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: `calc(100% - ${labelWidth}px)`,
        }}
      >
        {children}
      </div>
    </Input.Group>
  );
}
