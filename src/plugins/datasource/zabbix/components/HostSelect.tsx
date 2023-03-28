import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import _ from 'lodash';
import { BaseParams, Host } from '../types';
import { filterData } from '../utils';
import { getHostsAndFilteredIDs } from '../datasource';

interface HostSelectProps {
  baseParams: BaseParams;
  groupids: string[];
  onSelect: (value: string[]) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export default function HostSelect(props: HostSelectProps) {
  const { baseParams, groupids, onSelect, value, onChange } = props;
  const { cate, cluster } = baseParams;
  const [data, setData] = useState<Host[]>([]);

  useEffect(() => {
    if (!cluster || _.isEmpty(groupids)) return;
    getHostsAndFilteredIDs({
      cate,
      cluster,
      groupids,
    }).then((res) => {
      setData(res.data);
      onSelect(res.filteredIDs);
    });
  }, [cluster, _.join(groupids)]);

  return (
    <AutoComplete
      style={{ width: '100%' }}
      dropdownMatchSelectWidth={false}
      options={[
        {
          value: '/.*/',
          label: '/.*/',
        },
        ..._.map(data, (item) => {
          return {
            value: item.name,
            label: item.name,
          };
        }),
      ]}
      onBlur={(e: any) => {
        const value = e.target.value as string;
        const filtered = filterData<Host>(data, value);
        onSelect(_.map(filtered, 'hostid'));
      }}
      value={value}
      onChange={onChange}
    />
  );
}
