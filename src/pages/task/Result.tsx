import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Divider, Tag, Row, Col, Button } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useAntdTable } from '@umijs/hooks';
import FieldCopy from './FieldCopy';
import request from '@/utils/request';
import api from '@/utils/api';

interface HostItem {
  host: string,
  status: string,
}

const index = (props: any) => {
  const taskResultCls = 'job-task-result';
  const { params } = props.match;
  const taskId = params.id;
  const { t } = useTranslation();
  const [activeStatus, setActiveStatus] = useState('total');
  const [data, setData] = useState({} as any);
  const getTableData = () => {
    return request(`${api.task}/${params.id}`).then((data) => {
      setData({
        ...data.meta,
        action: data.action,
      });
      return {
        data: data.hosts,
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
    request(`${api.task}/${taskId}/host`, {
      method: 'PUT',
      body: JSON.stringify({
        host, action,
      }),
    }).then(() => {
      refresh();
    });
  };

  const handleTaskAction = (action: string) => {
    request(`${api.task}/${taskId}/action`, {
      method: 'PUT',
      body: JSON.stringify({
        action,
      }),
    }).then(() => {
      refresh();
    });
  };

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
            <a
              href={`/task-output/${params.id}/${record.host}/stdout`}
              target="_blank"
            >
              stdout
            </a>
            <Divider type="vertical" />
            <a
              href={`/task-output/${params.id}/${record.host}/stderr`}
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
  const renderHostStatusFilter = () => {
    const groupedHosts = _.groupBy(tableProps.dataSource, 'status');

    return _.map(groupedHosts, (chosts, status) => {
      return (
        <span key={status}>
          <a
            className={activeStatus === status ? 'active' : ''}
            onClick={() => {
              setActiveStatus(status);
            }}
          >
            {status} ({chosts.length})
          </a>
          <Divider type="vertical" />
        </span>
      );
    });
  }
  return (
    <>
      <Row style={{ marginBottom: 20 }}>
        <Col span={18}>
          <h3 style={{ marginBottom: 10, fontSize: 12, fontWeight: 'bolder' }}>{data.title}</h3>
          <div className={taskResultCls}>
            <Link to={{ pathname: '/job-tasks' }}>{'<'}返回列表</Link>
            <Divider type="vertical" />
            {t('task.done')}: {_.toString(data.done)}
            <Divider type="vertical" />
            <a href={`/task-output/${taskId}/stdout`} target="_blank">stdouts</a>
            <Divider type="vertical" />
            <a href={`/task-output/${taskId}/stderr`} target="_blank">stderrs</a>
            <Divider type="vertical" />
            <a className={activeStatus === 'total' ? 'active' : ''} onClick={() => setActiveStatus('total')}>total ({tableProps.dataSource.length})</a>
            <Divider type="vertical" />
            {renderHostStatusFilter()}
            <Link to={{ pathname: `/job-tasks/${taskId}/detail` }}>{t('task.meta')}</Link>
            <Divider type="vertical" />
            <Link to={{ pathname: '/job-tasks/add', search: `task=${taskId}` }}>{t('task.clone')}</Link>
            <Divider type="vertical" />
            <a onClick={() => { refresh(); }}>{t('task.refresh')}</a>
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
    </>
  )
}

export default index;
