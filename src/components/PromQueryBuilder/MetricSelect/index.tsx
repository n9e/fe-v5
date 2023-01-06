import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import { getMetric } from '@/services/dashboard';
import FormItem from '../components/FormItem';

interface IProps {
  datasourceValue: string;
  params: {
    start: number;
    end: number;
  };
  value?: string;
  onChange: (val: string) => void;
}

export default function index(props: IProps) {
  const { datasourceValue, params, value, onChange } = props;
  const [metricData, setMetricData] = useState<string[]>([]);

  useEffect(() => {
    getMetric(params, datasourceValue).then((res) => {
      setMetricData(res.data);
    });
  }, []);

  return (
    <FormItem
      label='指标'
      style={{
        width: 'calc(50% - 4px)',
      }}
    >
      <Select
        style={{ width: '100%' }}
        showSearch
        value={value}
        onChange={(val) => {
          onChange(val);
        }}
      >
        {_.map(metricData, (item) => {
          return (
            <Select.Option key={item} value={item}>
              {item}
            </Select.Option>
          );
        })}
      </Select>
    </FormItem>
  );
}
