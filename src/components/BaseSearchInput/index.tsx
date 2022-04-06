/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
