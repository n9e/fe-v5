import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import { getLabelNames } from '@/services/dashboard';
import { getMatchByLabels } from './utils';

interface IProps {
  metric?: string;
  labels: {
    label: string;
    value: string;
    op: string;
  }[];
  datasourceValue: string;
  params: {
    start: number;
    end: number;
  };
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
  value?: string;
  onChange: (val: string) => void;
}

export default function LabelNameSelect(props: IProps) {
  const { metric, labels, datasourceValue, params, style, size, value, onChange } = props;
  const [labelNames, setLabelNames] = useState<string[]>([]);

  useEffect(() => {
    if (metric) {
      getLabelNames(
        {
          ...params,
          'match[]': getMatchByLabels(metric, labels, value),
        },
        datasourceValue,
      ).then((res) => {
        setLabelNames(res.data);
      });
    }
  }, [metric, labels]);

  return (
    <Select
      style={{
        ...(style || {}),
      }}
      size={size}
      showSearch
      value={value}
      onChange={onChange}
    >
      {_.map(labelNames, (item) => {
        return (
          <Select.Option key={item} value={item}>
            {item}
          </Select.Option>
        );
      })}
    </Select>
  );
}
