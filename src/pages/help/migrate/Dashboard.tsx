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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Select, Table, Button } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { getDashboard } from '@/services/dashboard';
import { exportDashboard, migrateDashboard } from '@/services/dashboardV2';
import { getBusiGroups } from '@/services/common';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { convertDashboardV1ToV2 } from './utils';

export default function Dashboard() {
  const { busiGroups, curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const [busiId, setBusiId] = useState<string>();
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);
  const [list, setList] = useState<any[]>([]);
  const [tableKey, setTableKey] = useState(_.uniqueId('tableKey_'));
  const listStatus = useRef({});
  const [allMigrated, setAllMigrated] = useState(false);
  const fetchBusiGroup = (e) => {
    getBusiGroups(e).then((res) => {
      setFilteredBusiGroups(res.dat || []);
    });
  };
  const handleSearch = useCallback(_.debounce(fetchBusiGroup, 800), []);
  const migrate = async () => {
    if (busiId) {
      _.forEach(list, (item) => {
        listStatus.current[item.id] = 'migrating';
      });
      try {
        const data = await exportDashboard(busiId, _.map(list, 'id'));
        for (const item of data) {
          const findedId = _.get(_.find(list, { name: item.name }), 'id');
          await migrateDashboard(findedId, convertDashboardV1ToV2(item));
          listStatus.current[findedId] = 'migrated';
          setTableKey(_.uniqueId('tableKey_'));
        }
        setAllMigrated(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    setBusiId(_.get(curBusiItem, 'id'));
  }, [curBusiItem]);

  useEffect(() => {
    setFilteredBusiGroups(busiGroups);
  }, [JSON.stringify(busiGroups)]);

  useEffect(() => {
    if (busiId) {
      getDashboard(_.toNumber(busiId)).then((res) => {
        setList(res.dat);
      });
    }
  }, [busiId]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Select
          allowClear
          showSearch
          style={{ minWidth: 120 }}
          placeholder='业务组'
          dropdownClassName='overflow-586'
          filterOption={false}
          onSearch={handleSearch}
          getPopupContainer={() => document.body}
          onFocus={() => {
            fetchBusiGroup('');
          }}
          onClear={() => {
            fetchBusiGroup('');
          }}
          value={busiId}
          onChange={(val: string) => {
            setBusiId(val);
          }}
        >
          {filteredBusiGroups.map((item) => (
            <Select.Option value={item.id} key={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
        <Button type='primary' onClick={migrate} disabled={allMigrated}>
          大盘迁移
        </Button>
      </div>
      <Table
        key={tableKey}
        rowKey='id'
        pagination={false}
        dataSource={list}
        columns={[
          {
            title: '大盘名称',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: '更新时间',
            dataIndex: 'update_at',
            key: 'update_at',
            render: (text) => {
              return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
            },
          },
          {
            title: '发布人',
            dataIndex: 'update_by',
            key: 'update_by',
          },
          {
            title: '状态',
            render: (record) => {
              return listStatus.current[record.id];
            },
          },
        ]}
      />
    </div>
  );
}
