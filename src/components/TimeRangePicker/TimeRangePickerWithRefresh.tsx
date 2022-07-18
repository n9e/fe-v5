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
