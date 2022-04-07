/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState } from 'react';
import { Tag, Popover, Table, Input, Button } from 'antd';
const { Search } = Input;
import { TagItem } from './index';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Tag as TagType } from '@/store/chart';
import SearchInput from '@/components/BaseSearchInput';
import { useTranslation } from 'react-i18next';
export interface FilterType {
  tagKey: string;
  data: TagType[];
}
interface Props {
  tagInfo: TagItem;
  onOk: (data: FilterType) => void;
}
export default function Filter(props: Props) {
  const { t } = useTranslation();
  const { tagInfo, onOk } = props;
  const { tagKey, tagValue, selectValue } = tagInfo;
  const [search, setSearch] = useState('');
  const [clicked, setClicked] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string[]>([]);
  const [selectedAmount, setSelectedAmount] = useState(0);
  interface DataType {
    name: string;
  } // rowSelection object indicates the need for row selection

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelectedValue(selectedRows.map((item) => item.name));
    },
  };

  const onSearch = (value) => {
    setSearch(value);
  };

  const handlePopoverApply = () => {
    let formatValue: TagType[] = selectedValue.map((value) => ({
      key: tagKey,
      value,
    }));
    onOk({
      tagKey: tagKey,
      data: formatValue,
    });
    setClicked(false);
    setSelectedAmount(formatValue.length);
  };

  const renderContent = (tagValue: string[]) => {
    const { t } = useTranslation();
    return (
      <>
        <SearchInput
          placeholder={t('请输入搜索关键词')}
          allowClear
          onSearch={onSearch}
        ></SearchInput>
        <Table
          className='tag-table'
          style={{
            width: '300px',
          }}
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          pagination={{
            pageSize: 5,
            simple: true,
          }}
          columns={[
            {
              title: 'Name',
              dataIndex: 'name',
            },
          ]}
          rowKey='name'
          dataSource={tagValue
            .filter((tag) => tag.includes(search))
            .map((v) => ({
              name: v,
            }))}
        />
        <Button
          onClick={handlePopoverApply}
          size='small'
          type='primary'
          className='tag-apply'
        >
          Apply
        </Button>
      </>
    );
  };

  const handleVisibleChange = (visible) => {
    setClicked(visible);
  };

  return (
    <Popover
      content={renderContent(tagValue)}
      title={tagKey}
      trigger='click'
      visible={clicked}
      onVisibleChange={handleVisibleChange}
    >
      <Tag onClick={() => setClicked(true)}>
        {tagKey}{' '}
        <span className='tag-num'>
          {selectedAmount > 0 ? selectedAmount : ''}
        </span>{' '}
        <DownOutlined />
      </Tag>
    </Popover>
  );
}
