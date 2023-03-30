import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import _ from 'lodash';
import { getApps } from '../services';
import { BaseParams, App } from '../types';
import { filterData } from '../utils';

interface AppSelectProps {
  baseParams: BaseParams;
  hostids: string[];
  onSelect: (value: string[]) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export default function AppSelect(props: AppSelectProps) {
  const { baseParams, hostids, onSelect, value, onChange } = props;
  const { cate, cluster } = baseParams;
  const [data, setData] = useState<App[]>([]);

  useEffect(() => {
    if (!cluster || _.isEmpty(hostids)) return;
    getApps({
      cate,
      cluster,
      hostids,
    }).then((res) => {
      const dat = _.unionBy(res, 'name');
      setData(dat);
      if (value) {
        const filtered = filterData<App>(dat, value);
        onSelect(_.map(filtered, 'applicationid'));
      }
    });
  }, [cluster, _.join(hostids)]);

  return (
    <AutoComplete
      allowClear
      style={{ width: '100%' }}
      dropdownMatchSelectWidth={false}
      options={_.map(data, (item) => {
        return {
          value: item.name,
          label: item.name,
        };
      })}
      onBlur={(e: any) => {
        const value = e.target.value as string;
        const filtered = filterData<App>(data, value);
        onSelect(_.map(filtered, 'applicationid'));
      }}
      filterOption={(inputValue, option) => {
        return option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
      }}
      value={value}
      onChange={onChange}
    />
  );
}
