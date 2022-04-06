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
