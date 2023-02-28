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
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, Select, Table, Tooltip, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import SelectedHosts from './SelectedHosts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { BusiGroupItem, CommonStoreState } from '@/store/commonInterface';
import { getBusiGroups } from '@/services/common';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
export default (props) => {
  const { t } = useTranslation();
  const { allHosts, changeSelectedHosts, changeBusiGroup, onSearchHostName } = props;
  const { Option } = Select;
  const [selectedHostsKeys, setSelectedHostsKeys] = useState<string[]>([]);
  const [selectedHosts, setSelectedHosts] = useState<any[]>([]);
  const { busiGroups, curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [curBusiItemInHostSelect, setCurBusiItemInHostSelect] = useState<BusiGroupItem | undefined>(curBusiItem);
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);
  const dispatch = useDispatch();
  const columns = [
    {
      title: t('对象标识'),
      dataIndex: 'ident',
      render: (t) => (
        <div
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {t}
        </div>
      ),
    },
    {
      title: t('标签'),
      dataIndex: 'tags',

      render(tagArr) {
        return (
          tagArr &&
          tagArr.map((item) => (
            <Tag color='purple' key={item}>
              {item}
            </Tag>
          ))
        );
      },
    },
    {
      title: t('备注'),
      dataIndex: 'note',
      render: (t) => (
        <div
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
          title={t}
        >
          {t}
        </div>
      ),
    },
  ]; // 初始化展示所有业务组

  useEffect(() => {
    if (!filteredBusiGroups.length) {
      setFilteredBusiGroups(busiGroups);
    }
  }, [busiGroups]);
  useEffect(() => {
    const selectedHosts = allHosts.slice(0, 10);
    setSelectedHostsKeys(selectedHosts.map((h) => h.ident));
    setSelectedHosts(selectedHosts);
    changeSelectedHosts && changeSelectedHosts(selectedHosts);
  }, [allHosts.map((h) => h.id + '').join('')]);
  const busiGroupsInHostSelect = busiGroups.concat([
    {
      id: 0,
      name: t('未归组对象'),
    } as BusiGroupItem,
  ]);
  let curSelectBusiGroup: string | undefined = undefined;

  if (curBusiItemInHostSelect) {
    curSelectBusiGroup = busiGroupsInHostSelect.find((bg) => bg.id === curBusiItemInHostSelect.id) ? String(curBusiItemInHostSelect.id) : undefined;
  } else {
    curSelectBusiGroup = undefined;
  }

  const fetchBusiGroup = (e) => {
    getBusiGroups(e).then((res) => {
      setFilteredBusiGroups(res.dat || []);
    });
  };

  const handleSearch = useCallback(debounce(fetchBusiGroup, 800), []);
  const selectBefore = (
    <div className='host-add-on'>
      <div className='title'>{t('监控对象')}</div>
      <div className='select-before'>
        <Select
          allowClear
          placeholder={t('按业务组筛选')}
          value={curSelectBusiGroup}
          dropdownMatchSelectWidth={false}
          style={{
            width: '100%',
            textAlign: 'left',
          }}
          showSearch={true}
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
          onChange={(busiItemId) => {
            let busiItemIdNum = Number(busiItemId);
            let data = filteredBusiGroups.find((bg) => bg.id === busiItemIdNum);

            if (busiItemIdNum === 0) {
              data = {
                id: 0,
                name: t('未归组对象'),
              } as BusiGroupItem;
            } else if (busiItemIdNum) {
              dispatch({
                type: 'common/saveData',
                prop: 'curBusiItem',
                data: data as BusiGroupItem,
              });
            }

            changeBusiGroup && changeBusiGroup(data);
            setCurBusiItemInHostSelect(data);
          }}
        >
          <Option key={0} value={'0'}>
            {t('未归组对象')}
          </Option>
          {filteredBusiGroups.map((bg) => (
            <Option key={bg.id} value={String(bg.id)}>
              {bg.name}
            </Option>
          ))}
        </Select>
      </div>
      <SearchOutlined
        style={{
          position: 'absolute',
          left: 190,
          zIndex: 2,
          top: 9,
        }}
      />
    </div>
  );
  return (
    <div className='host-select'>
      <div className='top-bar'>
        <Input
          placeholder={t('搜索，空格分隔多个关键字')}
          addonBefore={selectBefore}
          className='host-input'
          onPressEnter={(e) => {
            const { value } = e.target as HTMLInputElement;
            onSearchHostName && onSearchHostName(value);
          }}
        />
      </div>
      <Table
        className={allHosts.length > 0 ? 'host-list' : 'host-list-empty'}
        rowKey='ident'
        rowSelection={{
          selectedRowKeys: selectedHostsKeys,
          onChange: (selectedRowKeys: string[], selectedRows) => {
            setSelectedHostsKeys(selectedRowKeys);
            setSelectedHosts(selectedRows);
            changeSelectedHosts && changeSelectedHosts(selectedRows);
          },
        }}
        columns={columns}
        dataSource={allHosts}
        pagination={{
          simple: true,
        }}
      ></Table>
      <div
        style={{
          marginTop: -44,
        }}
      >
        <Button
          type='link'
          style={{
            paddingRight: 4,
          }}
          onClick={() => {
            changeSelectedHosts(allHosts);
            setSelectedHosts(allHosts);
            setSelectedHostsKeys(allHosts.map((h) => h.ident));
          }}
        >
          {t('全选所有')}
        </Button>
        |
        <SelectedHosts
          selectedHosts={selectedHosts}
          allHosts={allHosts}
          changeSelectedHosts={(selectedHosts) => {
            changeSelectedHosts(selectedHosts);
            setSelectedHosts(selectedHosts);
            setSelectedHostsKeys(selectedHosts.map((sh) => sh.ident));
          }}
        ></SelectedHosts>
      </div>
    </div>
  );
};
