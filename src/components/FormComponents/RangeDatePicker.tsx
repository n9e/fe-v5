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
import React, { useEffect } from 'react';
import { DatePicker, Form, Radio, RadioChangeEvent, Col } from 'antd';
import { RadioButtonProps } from 'antd/lib/radio/radioButton';
import { useState } from 'react';
import moment, { Moment } from 'moment';
import './index.less';
import { useTranslation } from 'react-i18next';
const { RangePicker } = DatePicker;
const longTime = 7 * 24 * 3600 * 1000 * 10000;
export type RangeDatePickerData = {
  btime: number;
  etime: number;
};
export interface IRangeDatePickerProps {
  value?: RangeDatePickerData;
  onChange?: (RangeDatePickerData) => unknown;
}
const todayTime = Date.now();

const RangeDatePicker: React.FC<IRangeDatePickerProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();
  const [defaultTimeGap, setDefaultTimeGap] = useState<number>(0);
  const [realBtime, setRealBtime] = useState<number>(0);
  const [realEtime, setRealEtime] = useState<number>(0);
  const radioData: (RadioButtonProps & {
    label: string;
  })[] = [
    {
      value: 3600 * 1000,
      label: t('1小时'),
    },
    {
      value: 2 * 3600 * 1000,
      label: t('2小时'),
    },
    {
      value: 6 * 3600 * 1000,
      label: t('6小时'),
    },
    {
      value: 12 * 3600 * 1000,
      label: t('12小时'),
    },
    {
      value: 24 * 3600 * 1000,
      label: t('1天'),
    },
    {
      value: 2 * 24 * 3600 * 1000,
      label: t('2天'),
    },
    {
      value: 7 * 24 * 3600 * 1000,
      label: t('7天'),
    },
    {
      value: 14 * 24 * 3600 * 1000,
      label: t('14天'),
    },
    {
      value: 30 * 24 * 3600 * 1000,
      label: t('30天'),
    },
    {
      value: 90 * 24 * 3600 * 1000,
      label: t('90天'),
    },
    {
      value: longTime,
      label: t('永久'),
    },
  ];
  useEffect(() => {
    if (value?.btime && value?.etime) {
      setRealEtime(value.etime * 1000);
      setRealBtime(value.btime * 1000);
      setDefaultTimeGap((value.etime - value.btime) * 1000);
    } else {
      setRealBtime(todayTime);
      setRealEtime(todayTime + radioData[0].value);
      setDefaultTimeGap(radioData[0].value);
      packOnChange(todayTime, todayTime + radioData[0].value);
    }
  }, [value?.btime, value?.etime]);

  const onRangeChange = (e: RadioChangeEvent) => {
    setDefaultTimeGap(e.target.value);
    packOnChange(todayTime, todayTime + e.target.value);
  };

  const changeTime = (dates, dateStrings) => {
    let start = dates[0];
    let end = dates[1];
    packOnChange(start.valueOf(), end.valueOf());
    setDefaultTimeGap(-1);
  };

  const packOnChange = (start: number, end: number) => {
    if (onChange) {
      onChange({
        btime: Math.floor(start / 1000),
        etime: Math.floor(end / 1000),
      });
    }
  };

  return (
    <div>
      <Radio.Group
        value={defaultTimeGap}
        style={{
          marginBottom: 8,
        }}
        onChange={onRangeChange}
      >
        {radioData.map((radioButtonItem) => (
          <Radio.Button
            key={radioButtonItem.label}
            value={radioButtonItem.value}
          >
            {radioButtonItem.label}
          </Radio.Button>
        ))}
      </Radio.Group>
      <div>
        {defaultTimeGap != longTime && (
          <RangePicker
            allowClear={false}
            value={[moment(realBtime), moment(realEtime)]}
            format='YYYY-MM-DD HH:mm:ss'
            onChange={changeTime}
            showTime
          />
        )}
      </div>
    </div>
  );
};

export default RangeDatePicker;
