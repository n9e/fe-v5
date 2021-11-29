import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Divider, Checkbox, Row, Col, Input, Select } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useAntdTable } from '@umijs/hooks';
import request from '@/utils/request';
import api from '@/utils/api';
import LeftTree from '@/components/LeftTree';
import PageLayout from '@/components/pageLayout';

interface DataItem {
  id: number,
  title: string,
}

function getTableData(options: any, busiId: number | undefined, query: string, mine: boolean, days: number) {
  if (busiId) {
    return request(`${api.tasks(busiId)}?limit=${options.pageSize}&p=${options.current}&query=${query}&mine=${mine ? 1 : 0}&days=${days}`).then((res) => {
      return { data: res.dat.list, total: res.dat.total };
    });
  }
  return Promise.resolve({ data: [], total: 0 });
}

const index = (_props: any) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [mine, setMine] = useState(true);
  const [days, setDays] = useState(7);
  const [busiId, setBusiId] = useState<number>();
  const { tableProps } = useAntdTable((options) => getTableData(options, busiId, query, mine, days), [query, mine, days]);

  const columns: ColumnProps<DataItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
    }, {
      title: t('task.title'),
      dataIndex: 'title',
      width: 200,
      render: (text, record) => {
        return <Link to={{ pathname: `/job-tasks/${record.id}/result` }}>{text}</Link>;
      },
    }, {
      title: t('table.operations'),
      width: 150,
      render: (_text, record) => {
        return (
          <span>
            <Link to={{ pathname: '/job-tasks/add', search: `task=${record.id}` }}>{t('task.clone')}</Link>
            <Divider type="vertical" />
            <Link to={{ pathname: `/job-tasks/${record.id}/detail` }}>{t('task.meta')}</Link>
          </span>
        );
      },
    }, {
      title: t('task.done'),
      dataIndex: 'done',
      width: 100,
      render: (text) => {
        return _.toString(text);
      },
    }, {
      title: t('task.creator'),
      dataIndex: 'create_by',
      width: 100,
    }, {
      title: t('task.created'),
      dataIndex: 'create_at',
      width: 160,
      render: (text) => {
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];
  return (
    <PageLayout title={t('监控大盘')}>
      <div style={{ display: 'flex' }}>
        <LeftTree busiGroup={{ onChange: (id) => setBusiId(id) }}></LeftTree>
        <div style={{ flex: 1, padding: 20 }}>
          <Row>
            <Col span={16} className="mb10">
              <Input.Search
                style={{ width: 200, marginLeft: 8 }}
                className="mr10"
                onSearch={(val) => setQuery(val)}
              />
              <Select
                className="mr10"
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
              <Checkbox checked={mine} onChange={(e) => {
                setMine(e.target.checked);
              }}>
                {t('task.only.mine')}
              </Checkbox>
            </Col>
          </Row>
          <Table
            rowKey="id"
            columns={columns as any}
            {...tableProps as any}
          />
        </div>
      </div>
    </PageLayout>
  )
}

export default index;
