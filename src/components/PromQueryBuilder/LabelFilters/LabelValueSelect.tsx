import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import { getLabelValues } from '@/services/dashboard';

interface IProps {
  label: string;
  datasourceValue: string;
  params: {
    start: number;
    end: number;
  };
  style?: React.CSSProperties;
  value?: string;
  onChange: (val: string) => void;
}

export default function LabelValueSelect(props: IProps) {
  const { label, datasourceValue, params, style, value, onChange } = props;
  const [labelValues, setLabelValues] = useState<string[]>([]);

  useEffect(() => {
    if (label) {
      getLabelValues(label, params, datasourceValue).then((res) => {
        setLabelValues(res.data);
      });
    }
  }, [label]);

  return (
    <Select
      style={{
        ...(style || {}),
      }}
      showSearch
      value={value}
      onChange={onChange}
    >
      {_.map(labelValues, (item) => {
        return (
          <Select.Option key={item} value={item}>
            {item}
          </Select.Option>
        );
      })}
    </Select>
  );
}
