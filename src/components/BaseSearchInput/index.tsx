import React, { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, InputProps } from 'antd';
import { useTranslation } from 'react-i18next';
interface IBaseSearchInputProps extends InputProps {
  onSearch?: (value: string) => unknown;
}

const BaseSearchInput: React.FC<IBaseSearchInputProps> = ({
  onSearch,
  ...props
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>('');
  return (
    <Input
      prefix={<SearchOutlined />}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);

        if (e.target.value === '') {
          onSearch && onSearch('');
        }
      }}
      onPressEnter={(e) => {
        onSearch && onSearch(value);
      }}
      {...props}
    />
  );
};

export default BaseSearchInput;
