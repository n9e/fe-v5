import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import _ from 'lodash';
import { BaseParams, Group } from '../types';
import { filterData } from '../utils';
import { getGroupsAndFilteredIDs } from '../datasource';

interface GroupSelectProps {
  baseParams: BaseParams;
  onSelect: (value: string[]) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export default function GroupSelect(props: GroupSelectProps) {
  const { baseParams, onSelect, value, onChange } = props;
  const { cate, cluster } = baseParams;
  const [data, setData] = useState<Group[]>([]);

  useEffect(() => {
    if (!cluster) return;
    getGroupsAndFilteredIDs({ cate, cluster, value }).then((res) => {
      setData(res.data);
      onSelect(res.filteredIDs);
    });
  }, [cluster]);

  return (
    <AutoComplete
      allowClear
      style={{ width: '100%' }}
      dropdownMatchSelectWidth={false}
      options={data.map((item) => {
        return {
          value: item.name,
          label: item.name,
        };
      })}
      onBlur={(e: any) => {
        const value = e.target.value as string;
        const filtered = filterData<Group>(data, value);
        onSelect(_.map(filtered, 'groupid'));
      }}
      filterOption={(inputValue, option) => {
        return option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
      }}
      value={value}
      onChange={onChange}
    />
  );
}
