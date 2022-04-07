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
import dayjs from 'dayjs'; // import * as localeData from 'dayjs/plugin/localeData';
// import * as localizedFormat from 'dayjs/plugin/localizedFormat';
// import * as weekday from 'dayjs/plugin/weekday';

import { Calendar } from '@y0c/react-datepicker';
import './styles/calendar.less';
import { useTranslation } from 'react-i18next';
interface Props {
  open: boolean;
  onChange: Function;
}
export const formatDate = (date: dayjs.Dayjs | undefined, format: string) => {
  if (date === undefined) return '';
  return dayjs(date).format(format);
};
export default function RangePicker(props: Props) {
  const { t } = useTranslation();
  const { open, onChange } = props;
  const [start, setStart] = useState<dayjs.Dayjs>();
  const [end, setEnd] = useState<dayjs.Dayjs>();
  const [hoverDate, setHoverDate] = useState<dayjs.Dayjs>();

  const handleMouseOver = (date: dayjs.Dayjs) => {
    setHoverDate(date);
  };

  const isDayAfter = (day1: dayjs.Dayjs, day2: dayjs.Dayjs) => {
    return dayjs(day1).isAfter(day2, 'date');
  };

  const isDayBefore = (day1: dayjs.Dayjs, day2: dayjs.Dayjs) => {
    return dayjs(day1).isBefore(day2, 'date');
  };

  const isDayRange = (
    date: dayjs.Dayjs,
    start?: dayjs.Dayjs,
    end?: dayjs.Dayjs,
  ) => {
    if (!start || !end) return false;
    return isDayAfter(date, start) && isDayBefore(date, end);
  };

  const handleCalendarClass = (date: dayjs.Dayjs) => {
    if (start && !end && hoverDate) {
      if (isDayRange(date, start, hoverDate)) {
        return 'calendar__day--range';
      }
    }

    return '';
  };

  const handleDisable = (date: dayjs.Dayjs) => {
    return dayjs(date).isAfter(dayjs(), 'date');
  };

  const handleDateChange = (date: dayjs.Dayjs) => {
    let startDate: dayjs.Dayjs | undefined;
    let endDate: dayjs.Dayjs | undefined;
    startDate = start;
    endDate = end;

    if (!start) {
      startDate = date;
    } else {
      if (end) {
        startDate = date;
        endDate = undefined;
      } else {
        if (!isDayBefore(date, start)) {
          endDate = date;
        } else {
          startDate = date;
        }
      }
    }

    setStart(startDate);
    setEnd(endDate);
    onChange({
      startDate,
      endDate,
    });
  };

  return (
    <>
      {open && (
        <Calendar
          base={dayjs()}
          startDay={start}
          endDay={end}
          showMonthCnt={2}
          customDayClass={handleCalendarClass}
          onChange={handleDateChange}
          onMouseOver={handleMouseOver}
          disableDay={handleDisable}
        />
      )}
    </>
  );
}
