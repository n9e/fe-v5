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
import { Space } from 'antd';
import _ from 'lodash';
import AutoRefresh from '@/components/AutoRefresh';
import TimeRangePicker from './index';
import { IRawTimeRange } from './types';

interface IProps {
  style?: object;
  value?: IRawTimeRange;
  onChange?: (value: IRawTimeRange) => void;
  refreshTooltip?: string;
}

export default function TimeRangePickerWithRefresh(props: IProps) {
  const { value, onChange, style, refreshTooltip } = props;
  return (
    <Space style={style}>
      <AutoRefresh
        tooltip={refreshTooltip}
        onRefresh={() => {
          if (value && onChange) {
            onChange({
              ...value,
              refreshFlag: _.uniqueId('refreshFlag_ '),
            });
          }
        }}
      />
      <TimeRangePicker value={value} onChange={onChange} />
    </Space>
  );
}
