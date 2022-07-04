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
import { Link, useHistory } from 'react-router-dom';
import { Table, Divider, Checkbox, Row, Col, Input, Select, Button } from 'antd';
import { SearchOutlined, CodeOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useAntdTable } from 'ahooks';
import request from '@/utils/request';
import api from '@/utils/api';
import LeftTree from '@/components/LeftTree';
import PageLayout from '@/components/pageLayout';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';

interface DataItem {
  id: number;
  title: string;
}

function getTableData(options: any, busiId: number | undefined, query: string, mine: boolean, days: number) {
  if (busiId) {
    return request(`${api.tasks(busiId)}?limit=${options.pageSize}&p=${options.current}&query=${query}&mine=${mine ? 1 : 0}&days=${days}`).then((res) => {
      return { list: res.dat.list, total: res.dat.total };
    });
  }
  return Promise.resolve({ list: [], total: 0 });
}

const index = (_props: any) => {
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [mine, setMine] = useState(true);
  const [days, setDays] = useState(7);
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const { tableProps } = useAntdTable((options) => getTableData(options, curBusiItem.id, query, mine, days), { refreshDeps: [curBusiItem.id, query, mine, days] });
  const columns: ColumnProps<DataItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
    },
    {
      title: t('task.title'),
      dataIndex: 'title',
      width: 200,
      render: (text, record) => {
        return <Link to={{ pathname: `/job-tasks/${record.id}/result` }}>{text}</Link>;
      },
    },
    {
      title: t('table.operations'),
      width: 150,
      render: (_text, record) => {
        return (
          <span>
            <Link to={{ pathname: '/job-tasks/add', search: `task=${record.id}` }}>{t('task.clone')}</Link>
            <Divider type='vertical' />
            <Link to={{ pathname: `/job-tasks/${record.id}/detail` }}>{t('task.meta')}</Link>
          </span>
        );
      },
    },
    {
      title: t('task.creator'),
      dataIndex: 'create_by',
      width: 100,
    },
    {
      title: t('task.created'),
      dataIndex: 'create_at',
      width: 160,
      render: (text) => {
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];
  return (
    <PageLayout
      hideCluster
      title={
        <>
          <CodeOutlined />
          {t('执行历史')}
        </>
      }
    >
      <div style={{ display: 'flex' }}>
        <LeftTree></LeftTree>
        {curBusiItem.id ? (
          <div style={{ flex: 1, padding: 10 }}>
            <Row>
              <Col span={16} className='mb10'>
                <Input
                  style={{ width: 200, marginRight: 10 }}
                  prefix={<SearchOutlined />}
                  defaultValue={query}
                  onPressEnter={(e) => {
                    setQuery(e.currentTarget.value);
                  }}
                  placeholder='搜索标题'
                />
                <Select
                  style={{ marginRight: 10 }}
                  value={days}
                  onChange={(val: number) => {
                    setDays(val);
                  }}
                >
                  <Select.Option value={7}>{t('last.7.days')}</Select.Option>
                  <Select.Option value={15}>{t('last.15.days')}</Select.Option>
                  <Select.Option value={30}>{t('last.30.days')}</Select.Option>
                  <Select.Option value={60}>{t('last.60.days')}</Select.Option>
                  <Select.Option value={90}>{t('last.90.days')}</Select.Option>
                </Select>
                <Checkbox
                  checked={mine}
                  onChange={(e) => {
                    setMine(e.target.checked);
                  }}
                >
                  {t('task.only.mine')}
                </Checkbox>
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Button
                  type='primary'
                  ghost
                  onClick={() => {
                    history.push(import.meta.env.VITE_PREFIX + '/job-tasks/add');
                  }}
                >
                  {t('task.temporary.create')}
                </Button>
              </Col>
            </Row>
            <Table
              rowKey='id'
              columns={columns as any}
              {...(tableProps as any)}
              pagination={
                {
                  ...tableProps.pagination,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '50', '100', '500', '1000'],
                  showTotal: (total) => {
                    return i18n.language == 'en' ? `Total ${total} items` : `共 ${total} 条`;
                  },
                } as any
              }
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text={t('执行历史')}></BlankBusinessPlaceholder>
        )}
      </div>
    </PageLayout>
  );
};

export default index;
