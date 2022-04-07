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
import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import RangePicker, { formatDate } from '@/components/BaseRangePicker';
import { InsertRowAboveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
const { Option } = Select;
import { ranges } from './const';
import './index.less';
import { useTranslation } from 'react-i18next';

export interface Param {
  start: number;
  end: number;
}

export function isParam(range: any): range is Param {
  if (range && range.start && range.end) {
    return true;
  }
  return false;
}

export interface RangeItem {
  num: number;
  unit: string;
  shortUnit: dayjs.OpUnitType;
}

interface Props {
  initValue?: Param | RangeItem;
  onChange: (data: Param | RangeItem) => void;
}
export const generateTimeStampRange = (range: RangeItem): Param => {
  const { num, shortUnit } = range;
  let end = dayjs().unix();
  let start = dayjs().subtract(num, shortUnit).unix();
  return {
    start,
    end,
  };
};
export const formatPickerDate = (r?: Param | RangeItem) => {
  let newR = r;

  if (newR) {
    if (isParam(newR)) {
      const { start, end } = newR;
      return {
        start,
        end,
      };
    } else {
      return generateTimeStampRange(newR);
    }
  }

  return {
    start: 0,
    end: 0,
  };
};
export default function DateRangePicker(props: Props) {
  const { t } = useTranslation();
  const { onChange, initValue } = props;
  const [time, setTime] = useState<string | number>('');
  const [open, setOpen] = useState(false);
  const [isFromCalendar, setIsFromCalendar] = useState(false);

  const handleSelectChange = (e) => {
    if (e > ranges.length - 1) {
      setOpen(true);
    } else {
      setTime(e);
      onChange(ranges[e]);
      setIsFromCalendar(false);
    }
  };

  const handleRangePickerChange = (e) => {
    if (e.startDate && e.endDate) {
      setOpen(false);
      setTime(
        `${formatDate(e['startDate'], 'YY-MM-DD')}  --  ${formatDate(
          e['endDate'],
          'YY-MM-DD',
        )}`,
      );
      onChange({
        start: dayjs(e['startDate']).unix(),
        end: dayjs(e['endDate']).unix(),
      });
    }
  };

  const formatInitValue = (r?: Param | RangeItem) => {
    if (isParam(r)) {
      const { start, end } = r;
      setTime(
        `${dayjs(start * 1000).format('YY-MM-DD')}  --  ${dayjs(
          end * 1000,
        ).format('YY-MM-DD')}`,
      );
    } else {
      const i = ranges.findIndex(
        (item) => item.num === r?.num && item.unit === r.unit,
      );
      setTime(i);
    }
  };

  useEffect(() => {
    // 如果有默认值，则默认不向外抛事件
    if (initValue) {
      formatInitValue(initValue);
    } else {
      // emit the init value, now default value is 1 hour
      setTime(3);
      onChange(ranges[3]);
    }
  }, []);
  useEffect(() => {
    // 如果点击的是组件以外则关闭弹框
    function hideTheCalendar(e) {
      console.log('hideTheCalendar');
      e.preventDefault();
      let calendarIndex = [].findIndex.call(
        e.path,
        (item: { className: string }) => item.className === 'calendar',
      );

      if (calendarIndex < 0) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('click', hideTheCalendar, true);
    }

    return () => {
      document.removeEventListener('click', hideTheCalendar, true);
    };
  }, [open]);
  return (
    <div className={isFromCalendar ? 'range-picker calendar' : 'range-picker'}>
      {
        <span
          className={
            isFromCalendar ? 'tag from-calendar show' : 'tag from-calendar'
          }
        >
          5m
        </span>
      }
      {/* <button style={{position: 'absolute', zIndex: 3}} onClick={() =>setOpen(false)}>close</button> */}
      <Select
        className='select'
        value={time}
        onChange={handleSelectChange}
        dropdownStyle={{
          marginLeft: '60px',
        }}
      >
        {ranges.map((item, i) => (
          <Option key={i} value={i}>
            {' '}
            <span className='tag'>
              {item.num}
              {item.shortUnit}
            </span>
            Past {item.num} {item.unit}
          </Option>
        ))}
        <Option key={ranges.length} value={ranges.length}>
          {' '}
          <span className='tag'>
            <b>
              <InsertRowAboveOutlined />
            </b>
          </span>
          Select from calendar{' '}
        </Option>
      </Select>
      <RangePicker open={open} onChange={handleRangePickerChange} />
    </div>
  );
}
