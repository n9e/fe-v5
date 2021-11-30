import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Divider, Tag, Row, Col, Button, Card } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { useAntdTable } from '@umijs/hooks';
import FieldCopy from './FieldCopy';
import request from '@/utils/request';
import api from '@/utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';

interface HostItem {
  host: string,
  status: string,
}

const index = (props: any) => {
  const taskResultCls = 'job-task-result';
  const query = queryString.parse(_.get(props, 'location.search'));
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const { params } = props.match;
  const taskId = params.id;
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState('total');
  const [data, setData] = useState({} as any);
  const getTableData = () => {
    return request(`${api.task(curBusiItem.id)}/${params.id}`).then((data) => {
      setData({
        ...data.dat.meta,
        action: data.dat.action,
      });
      return {
        data: data.dat.hosts,
      };
    });
  };
  const { tableProps, refresh } = useAntdTable(() => getTableData(), []);
  let tableDataSource = tableProps.dataSource;
  if (activeStatus !== 'total') {
    tableDataSource = _.filter(tableDataSource, (item: any) => {
      return item.status === activeStatus;
    });
  }
  tableProps.pagination.total = tableDataSource.length;

  const handleHostAction = (host: string, action: string) => {
    request(`${api.task(curBusiItem.id)}/${taskId}/host/${host}/action`, {
      method: 'PUT',
      body: JSON.stringify({
        action,
      }),
    }).then(() => {
      refresh();
    });
  };

  const handleTaskAction = (action: string) => {
    request(`${api.task(curBusiItem.id)}/${taskId}/action`, {
      method: 'PUT',
      body: JSON.stringify({
        action,
      }),
    }).then(() => {
      refresh();
    });
  };

  const renderHostStatusFilter = () => {
    const groupedHosts = _.groupBy(tableProps.dataSource, 'status');

    return _.map(groupedHosts, (chosts, status) => {
      return {
        text: `${status} (${chosts.length})`,
        value: status
      }
    });
  }

  const columns: ColumnProps<HostItem>[] = [
    {
      title: (
        <FieldCopy
          dataIndex="host"
          hasSelected={false}
          data={tableDataSource}
        />
      ),
      dataIndex: 'host',
    }, {
      title: t('task.status'),
      dataIndex: 'status',
      filters: renderHostStatusFilter(),
      onFilter: (value, record) => record.status === value,
      render: (text) => {
        if (text === 'success') {
          return <Tag color="#87d068">{text}</Tag>;
        } else if (text === 'cancelled' || text === 'ignored') {
          return <Tag color="#ec971f">{text}</Tag>;
        } else if (text === 'failed' || text === 'killfailed' || text === 'timeout') {
          return <Tag color="#f50">{text}</Tag>;
        }
        return <Tag>{text}</Tag>;
      },
    }, {
      title: t('task.output'),
      render: (_text, record) => {
        return (
          <span>
            <Link
              to={`/job-task/${curBusiItem.id}/output/${params.id}/${record.host}/stdout`}
              target="_blank"
            >
              stdout
            </Link>
            <Divider type="vertical" />
            <a
              href={`/job-task/${curBusiItem.id}/output/${params.id}/${record.host}/stderr`}
              target="_blank"
            >
              stderr
            </a>
          </span>
        );
      },
    },
  ];
  if (!data.done) {
    columns.push({
      title: t('table.operations'),
      render: (_text, record) => {
        return (
          <span>
            <a onClick={() => handleHostAction(record.host, 'ignore')}>ignore</a>
            <Divider type="vertical" />
            <a onClick={() => handleHostAction(record.host, 'redo')}>redo</a>
            <Divider type="vertical" />
            <a onClick={() => handleHostAction(record.host, 'kill')}>kill</a>
          </span>
        );
      },
    });
  }
  
  return (
    <PageLayout title={<Link to={{ pathname: '/job-tasks' }}>{'<'} 执行历史</Link>}>
      <div style={{ padding: 20 }} className={taskResultCls}>
      <Card
        title={data.title}
        extra={<a onClick={() => { refresh(); }}>{t('task.refresh')}</a>}
      >
        <Row style={{ marginBottom: 20 }}>
          <Col span={18}>
            <div>
              <a href={`/job-task/${curBusiItem.id}/output/${taskId}/stdout`} target="_blank">stdouts</a>
              <Divider type="vertical" />
              <a href={`/job-task/${curBusiItem.id}/output/${taskId}/stderr`} target="_blank">stderrs</a>
              <Divider type="vertical" />
              <Link to={{ pathname: `/job-tasks/${taskId}/detail` }}>{t('task.meta')}</Link>
              <Divider type="vertical" />
              <Link to={{ pathname: '/job-tasks/add', search: `task=${taskId}` }}>{t('task.clone')}</Link>
            </div>
          </Col>
          <Col span={6} className="textAlignRight">
            {
              !data.done ?
                <span>
                  {
                    data.action === 'start' ?
                      <Button className="success-btn" onClick={() => handleTaskAction('pause')}>Pause</Button> :
                      <Button className="success-btn" onClick={() => handleTaskAction('start')}>Start</Button>
                  }
                  <Button className="ml10 warning-btn" onClick={() => handleTaskAction('cancel')}>Cancel</Button>
                  <Button className="ml10 danger-btn" onClick={() => handleTaskAction('kill')}>Kill</Button>
                </span> : null
            }
          </Col>
        </Row>
        <Table
          rowKey="host"
          columns={columns as any}
          {...tableProps as any}
          dataSource={tableDataSource as any}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '50', '100', '500', '1000'],
          } as any}
        />
      </Card>
      </div>
    </PageLayout>
  )
}

export default index;
