import React, { forwardRef, ReactNode, useImperativeHandle, useState } from 'react';
import { PlusSquareOutlined, SearchOutlined } from '@ant-design/icons';
import { Row, Col, Button, Popover, Table, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { getKafkaLag } from '../../LogSource/services';

interface Props {
  logSourceId: number;
  source?: string;
}

export interface IKafkaLag {
  topic: string;
  group: string;
  partition: number;
  current_offset: number;
  log_end_offset: number;
  lag: number;
  client_id: string;
}

const LogPopover = (props: Props, ref) => {
  const { logSourceId, source } = props;

  const [tableData, setTableData] = useState<IKafkaLag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);

  const defaultColumns = [
    {
      title: 'GROUP',
      dataIndex: 'group',
      ellipsis: true,
      width: 80,
    },
    {
      title: 'TOPIC',
      dataIndex: 'topic',
      ellipsis: true,
      width: 120,
    },
    {
      title: 'PARTITION',
      dataIndex: 'partition',
      width: 80,
    },
    {
      title: 'CURRENT_OFFSET',
      dataIndex: 'current_offset',
      width: 125,
    },
    {
      title: 'LOG_END_OFFSET',
      dataIndex: 'log_end_offset',
      width: 125,
    },
    {
      title: 'LAG',
      dataIndex: 'lag',
      ellipsis: true,
      width: 60,
    },
    {
      title: 'CLIENT_ID',
      dataIndex: 'client_id',
      ellipsis: true,
    },
  ];

  const handleClick = () => {
    setLoading(true);
    getKafkaLag(logSourceId)
      .then((res) => {
        // console.log('getKafkaLag', res);
        setTableData(res.data);
      })
      .finally(() => {
        setLoading(false);
        setVisible(true);
      });
  };

  const content = (
    <Table
      className='log_popover_table_box'
      loading={loading}
      rowKey={() => _.uniqueId('kafkaLag_')}
      columns={defaultColumns}
      dataSource={tableData}
      pagination={false}
      // style={{ maxWidth: '960px', overflowY: 'auto', whiteSpace: 'nowrap', maxHeight: '240px' }}
      style={{ maxWidth: '960px' }}
      size='small'
      scroll={{ y: 240 }}
    />
  );
  return (
    <Popover
      placement='topLeft'
      content={content}
      trigger='click'
      visible={visible}
      onVisibleChange={(val) => {
        !val && setVisible(val);
      }}
    >
      {source !== 'TopicManage' ? (
        <Button type='link' size='small' onClick={handleClick} disabled={loading}>
          查看延迟
        </Button>
      ) : (
        <Tooltip title='查看消息延迟'>
          <SearchOutlined style={{ marginRight: '8px' }} onClick={handleClick} />
        </Tooltip>
      )}
    </Popover>
  );
};

export default LogPopover;
