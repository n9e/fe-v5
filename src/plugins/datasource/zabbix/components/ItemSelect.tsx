import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import _ from 'lodash';
import { useDebounceFn } from 'ahooks';
import { BaseParams, Item } from '../types';
import { filterData } from '../utils';
import { getItemsFunc } from '../datasource';

interface ItemSelectProps {
  baseParams: BaseParams;
  group: string;
  host: string;
  application: string;
  itemType: 'text' | 'num';
  value?: string;
  onChange?: (value: string) => void;
}

export default function ItemSelect(props: ItemSelectProps) {
  const { baseParams, group, host, application, itemType, value, onChange } = props;
  const { cate, cluster } = baseParams;
  const [data, setData] = useState<Item[]>([]);
  const { run: fetchData } = useDebounceFn(
    () => {
      if (cluster) {
        getItemsFunc({
          cate,
          cluster,
          itemType,
          group,
          host,
          application,
          item: '/.*/',
        }).then((res) => {
          setData(res);
        });
      }
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    fetchData();
  }, [cluster, group, host, application]);

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
      filterOption={(inputValue, option) => {
        return option?.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
      }}
      value={value}
      onChange={onChange}
    />
  );
}
