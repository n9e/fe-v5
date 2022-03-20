import React from 'react';
import { Switch } from 'antd';

interface Props {
  label: string;
  checked?: boolean;
  onChange?: (value: boolean) => void;
}

export const SwitchWithLabel: React.FC<Props> = ({ checked, onChange, label }) => {
  console.log('checked', checked);
  return (
    <>
      <Switch checked={checked} onChange={onChange} style={{ marginRight: 5 }} />
      {label}
    </>
  );
};
