import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Divider, Checkbox, Row, Col, Input, Select, Button } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useAntdTable } from '@umijs/hooks';
import CreateIncludeNsTree from '@pkgs/Layout/CreateIncludeNsTree';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import request from '@pkgs/request';
import api from '@common/api';

interface DataItem {
  id: number,
  title: string,
}

function getTableData(options: any, query: string, mine: boolean, days: number) {
  return request(`${api.tasks}?limit=${options.pageSize}&p=${options.current}&query=${query}&mine=${mine ? 1 : 0}&days=${days}`).then((res) => {
    return { data: res.list, total: res.total };
  });
}

const index = (_props: any) => {
  // const intl = getIntl();
  const intlFmtMsg = useFormatMessage();
  const [query, setQuery] = useState('');
  const [mine, setMine] = useState(true);
  const [days, setDays] = useState(7);
  const { tableProps } = useAntdTable((options) => getTableData(options, query, mine, days), [query, mine, days]);

  const columns: ColumnProps<DataItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
    }, {
      title: intlFmtMsg({ id: 'task.title' }),
      dataIndex: 'title',
      width: 200,
      render: (text, record) => {
        return <Link to={{ pathname: `/tasks/${record.id}/result` }}>{text}</Link>;
      },
    }, {
      title: intlFmtMsg({ id: 'table.operations' }),
      width: 150,
      render: (_text, record) => {
        return (
          <span>
            <Link to={{ pathname: '/tasks-add', search: `task=${record.id}` }}>{intlFmtMsg({ id: 'task.clone' })}</Link>
            <Divider type="vertical" />
            <Link to={{ pathname: `/tasks/${record.id}/detail` }}>{intlFmtMsg({ id: 'task.meta' })}</Link>
          </span>
        );
      },
    }, {
      title: intlFmtMsg({ id: 'task.done' }),
      dataIndex: 'done',
      width: 100,
      render: (text) => {
        return _.toString(text);
      },
    }, {
      title: intlFmtMsg({ id: 'task.creator' }),
      dataIndex: 'creator',
      width: 100,
    }, {
      title: intlFmtMsg({ id: 'task.created' }),
      dataIndex: 'created',
      width: 160,
      render: (text) => {
        return moment(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];
  return (
    <>
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
            <Select.Option value={7}>{intlFmtMsg({ id: 'last.7.days' })}</Select.Option>
            <Select.Option value={15}>{intlFmtMsg({ id: 'last.15.days' })}</Select.Option>
            <Select.Option value={30}>{intlFmtMsg({ id: 'last.30.days' })}</Select.Option>
            <Select.Option value={60}>{intlFmtMsg({ id: 'last.60.days' })}</Select.Option>
            <Select.Option value={90}>{intlFmtMsg({ id: 'last.90.days' })}</Select.Option>
          </Select>
          <Checkbox checked={mine} onChange={(e) => {
            setMine(e.target.checked);
          }}>
            {intlFmtMsg({ id: 'task.only.mine' })}
          </Checkbox>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns as any}
        {...tableProps}
      />
    </>
  )
}

export default CreateIncludeNsTree(index, { visible: false });
