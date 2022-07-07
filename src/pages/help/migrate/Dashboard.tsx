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
import React, { useState, useEffect, useRef } from 'react';
import { Table, Button } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { getDashboard } from '@/services/dashboard';
import { exportDashboard, migrateDashboard } from '@/services/dashboardV2';
import { convertDashboardV1ToV2 } from './utils';

export default function Dashboard() {
  const [list, setList] = useState<any[]>([]);
  const [tableKey, setTableKey] = useState(_.uniqueId('tableKey_'));
  const listStatus = useRef({});
  const [allMigrated, setAllMigrated] = useState(false);
  const migrate = async () => {
    _.forEach(list, (item) => {
      listStatus.current[item.id] = 'migrating';
    });
    setTableKey(_.uniqueId('tableKey_'));
    try {
      const groupData = _.groupBy(list, 'group_id');
      for (const busiId of _.keys(groupData)) {
        const busiData = groupData[busiId];
        const data = await exportDashboard(busiId, _.map(busiData, 'id'));
        for (const item of data) {
          const finded = _.find(_.cloneDeep(list), { name: item.name });
          const findedId = _.get(finded, 'id');
          await migrateDashboard(findedId, convertDashboardV1ToV2(item)).catch((e) => {
            listStatus.current[findedId] = 'failed';
            setTableKey(_.uniqueId('tableKey_'));
            throw {
              id: finded,
              err: e.message,
            };
          });
          listStatus.current[findedId] = 'migrated';
          setTableKey(_.uniqueId('tableKey_'));
        }
        setAllMigrated(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getDashboard().then((res) => {
      setList(res.dat);
    });
  }, []);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
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
            title: '业务组',
            dataIndex: 'group_id',
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
