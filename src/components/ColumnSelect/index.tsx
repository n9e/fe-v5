import React, { useState, useCallback } from 'react';
import { Select, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { getBusiGroups } from '@/services/common';
import { CommonStoreState } from '@/store/commonInterface';
import { eventStoreState } from '@/store/eventInterface';
import { debounce } from 'lodash';
interface Props {
  noLeftPadding?: boolean;
  noRightPadding?: boolean;
  onClusterChange?: (v: string[]) => void;
  onBusiGroupChange?: (v: number) => void;
  onSeverityChange?: (v: number | undefined) => void;
  onEventTypeChange?: (v: number | undefined) => void;
}
export default function ColumnSelect(props: Props) {
  const { onSeverityChange, onEventTypeChange, onBusiGroupChange, onClusterChange, noLeftPadding, noRightPadding = true } = props;
  const { clusters, busiGroups } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);
  const fetchBusiGroup = (e) => {
    getBusiGroups(e).then((res) => {
      setFilteredBusiGroups(res.dat || []);
    });
  };
  const handleSearch = useCallback(debounce(fetchBusiGroup, 800), []);

  return (
    <Space style={{ marginLeft: noLeftPadding ? 0 : 8, marginRight: noRightPadding ? 0 : 8 }}>
      {onClusterChange && (
        <Select mode='multiple' allowClear style={{ minWidth: 80 }} placeholder='集群' onChange={onClusterChange}>
          {clusters.map((k) => (
            <Select.Option value={k} key={k}>
              {k}
            </Select.Option>
          ))}
        </Select>
      )}
      {onBusiGroupChange && (
        <Select
          allowClear
          showSearch
          style={{ minWidth: 120 }}
          placeholder='业务组'
          dropdownClassName='overflow-586'
          filterOption={false}
          onSearch={handleSearch}
          onFocus={() => {
            getBusiGroups('').then((res) => {
              setFilteredBusiGroups(res.dat || []);
            });
          }}
          onClear={() => {
            getBusiGroups('').then((res) => {
              setFilteredBusiGroups(res.dat || []);
            });
          }}
          onChange={onBusiGroupChange}
        >
          {filteredBusiGroups.map((item) => (
            <Select.Option value={item.id} key={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      )}
      {onSeverityChange && (
        <Select allowClear style={{ minWidth: 80 }} placeholder='事件级别' onChange={onSeverityChange}>
          <Select.Option value={1}>一级告警</Select.Option>
          <Select.Option value={2}>二级告警</Select.Option>
          <Select.Option value={3}>三级告警</Select.Option>
        </Select>
      )}
      {onEventTypeChange && (
        <Select allowClear style={{ minWidth: 80 }} placeholder='事件类别' onChange={onEventTypeChange}>
          <Select.Option value={0}>Triggered</Select.Option>
          <Select.Option value={1}>Recovered</Select.Option>
        </Select>
      )}
    </Space>
  );
}
