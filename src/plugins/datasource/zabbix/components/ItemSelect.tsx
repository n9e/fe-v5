import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'antd';
import _ from 'lodash';
import { getItems } from '../services';
import { BaseParams, Item } from '../types';
import { filterData } from '../utils';
import { getItemsAndFiltered } from '../datasource';

interface ItemSelectProps {
  baseParams: BaseParams;
  hostids: string[];
  applicationids: string[];
  itemType: 'text' | 'num';
  onSelect?: (value: Item[]) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export default function ItemSelect(props: ItemSelectProps) {
  const { baseParams, hostids, applicationids, itemType, onSelect, value, onChange } = props;
  const { cate, cluster } = baseParams;
  const [data, setData] = useState<Item[]>([]);

  console.log(hostids, applicationids);

  useEffect(() => {
    if (cluster) {
      getItemsAndFiltered({
        cate,
        cluster,
        itemType,
        hostids,
        applicationids,
      }).then((res) => {
        setData(res.data);
        onSelect && onSelect(res.filtered);
      });
    }
  }, [cluster, _.join(hostids), _.join(applicationids)]);

  return (
    <AutoComplete
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
        const filtered = filterData<Item>(data, value);
        onSelect && onSelect(filtered);
      }}
      value={value}
      onChange={onChange}
    />
  );
}
