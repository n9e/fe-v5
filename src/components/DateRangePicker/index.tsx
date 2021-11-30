import React, { useState, useEffect } from 'react';
import { Popover, Button, DatePicker } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import moment, { unitOfTime, Moment } from 'moment';
import './index.less';
import { useTranslation } from 'react-i18next';

type TimeUnit = 's' | 'ms';
interface Props {
  leftList?: RelativeRange[];
  unit?: TimeUnit;
  value?: Range;
  onChange: (value: Range) => void;
}

export type Range = RelativeRange | AbsoluteRange;

export interface RelativeRange {
  num: number;
  unit: unitOfTime.DurationConstructor;
  description: string;
}

export interface AbsoluteRange {
  start: number; // 毫秒
  end: number;
}
interface AbsoluteTimeStampRange {
  start: number;
  end: number;
}

export function isAbsoluteRange(range: any): range is AbsoluteRange {
  if (range && range.start && range.end) {
    return true;
  }
  return false;
}

export const generateTimeStampRange = (range: RelativeRange, timeUnit: TimeUnit = 's'): AbsoluteRange => {
  const { num, unit } = range;
  let end = timeUnit === 's' ? moment().unix() : moment().valueOf();
  let start = timeUnit === 's' ? moment().subtract(num, unit).unix() : moment().subtract(num, unit).valueOf();
  return {
    start,
    end,
  };
};

export const formatPickerDate = (r: Range, timeUnit: TimeUnit = 's'): AbsoluteTimeStampRange => {
  const { start, end } = isAbsoluteRange(r) ? r : generateTimeStampRange(r, timeUnit);
  return {
    start,
    end,
  };
};

export default function DateRangePicker(props: Props) {
  const { t } = useTranslation();
  const LeftItems: RelativeRange[] = [
    { num: 5, unit: 'minutes', description: t('minute') },
    { num: 15, unit: 'minutes', description: t('minutes') },
    { num: 30, unit: 'minutes', description: t('minutes') },
    { num: 1, unit: 'hour', description: t('hour') },
    { num: 2, unit: 'hours', description: t('hours') },
    { num: 6, unit: 'hours', description: t('hours') },
    { num: 12, unit: 'hours', description: t('hours') },
    { num: 1, unit: 'day', description: t('天') },
    { num: 1, unit: 'week', description: t('周') },
    { num: 1, unit: 'month', description: t('月') },
    { num: 1, unit: 'quarter', description: t('季度') },
  ];
  const { onChange, value, unit = 's', leftList = LeftItems } = props;
  const [visible, setVisible] = useState(false);
  const [startTime, setStartTime] = useState<Moment>(moment());
  const [endTime, setEndTime] = useState<Moment>(moment());
  const [leftSelect, setLeftSelect] = useState<number>(-1);
  const [label, setLabel] = useState<string>();

  useEffect(() => {
    if (!value) {
      const defaultSelect = 3;
      setLeftSelect(defaultSelect);
      emitValue(leftList[defaultSelect]);
      return;
    }
    // 如果外部被赋值，只需要改label和组件展示值，不需要向外抛
    if (isAbsoluteRange(value)) {
      value.start > 0 && value.end > 0 && formatExternalAbsoluteTime(value);
    } else {
      const i = LeftItems.findIndex(({ num, unit }) => num === value.num && unit === value.unit);
      setLeftSelect(i === -1 ? 0 : i);
      emitValue(leftList[i]);
    }
  }, [value]);

  const formatLabel = (r: Range, unit: TimeUnit): string => {
    if (isAbsoluteRange(r)) {
      const { start, end } = r;
      return moment(unit === 's' ? start * 1000 : start).format('YYYY.MM.DD HH:mm:ss') + ' 至 ' + moment(unit === 's' ? end * 1000 : end).format('YYYY.MM.DD HH:mm:ss');
    } else {
      const { num, description } = r;
      return `${t('最近')} ${num} ${description}`;
    }
  };

  const formatExternalAbsoluteTime = (value: AbsoluteRange) => {
    const { start, end } = value;
    setStartTime(moment(start));
    setEndTime(moment(end));
    setLabel(formatLabel(value, unit));
  };

  const handleStartTimeChange = (time, timeString) => {
    setStartTime(time);
  };

  const handleEndTimeChange = (time, timeString) => {
    setEndTime(time);
  };

  function endDisabledDate(current) {
    // Can not select days before today and before the start time
    return (
      // (current && current < startTime.endOf('seconds')) ||
      current && current > moment().endOf('seconds')
    );
  }

  function startDisabledDate(current) {
    // Can not select days before today and today
    return (
      // (current && current > endTime.endOf('seconds')) ||
      current && current > moment().endOf('seconds')
    );
  }

  const handleRightOk = () => {
    setVisible(false);
    setLeftSelect(-1);
    emitValue({
      start: unit === 's' ? startTime.unix() : startTime.valueOf(),
      end: unit === 's' ? endTime.unix() : endTime.valueOf(),
    });
  };

  const handleLeftClick = (i) => {
    setLeftSelect(i);
    emitValue(leftList[i]);
    setVisible(false);
  };

  const emitValue = (value: Range) => {
    onChange(value);
    setLabel(formatLabel(value, unit));
  };

  const content = (
    <div className='time-range-picker-wrapper'>
      <div className='time-range-picker-left'>
        {leftList.map(({ num, unit, description }, i) => (
          <Button key={i} type='link' onClick={() => handleLeftClick(i)} className={i === leftSelect ? 'active' : ''}>
            {t('最近')}
            <span className='num'>{num}</span>
            {description}
          </Button>
        ))}
      </div>

      <div className='time-range-picker-right'>
        <p className='title'>{t('自定义开始时间')}</p>
        <DatePicker showTime onChange={handleStartTimeChange} value={startTime} disabledDate={startDisabledDate} />
        <p className='title'>{t('自定义结束时间')}</p>
        <DatePicker showTime onChange={handleEndTimeChange} value={endTime} disabledDate={endDisabledDate} />
        <div className='footer'>
          <Button onClick={() => setVisible(false)}>{t('取消')}</Button>
          <Button type='primary' onClick={handleRightOk} disabled={startTime.endOf('seconds') >= endTime.endOf('seconds')}>
            {t('确定')}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Popover content={content} overlayClassName='time-range-picker' visible={visible}>
      <Button onClick={() => setVisible(true)}>
        {label} <CaretDownOutlined />
      </Button>
    </Popover>
  );
}
