import React, { useState } from 'react';
import { Input, Form, Select, Tooltip, InputNumber } from 'antd';
import { IFromItemBaseProps } from '../../types';
import { InfoCircleOutlined } from '@ant-design/icons';

const versionList = [
  // { lebel: '2.x', value: '2.x' },
  // { lebel: '5.x', value: '5.x' },
  // { lebel: '5.6+', value: '5.6+' },
  { lebel: '6.0+', value: '6.0+' },
  { lebel: '7.0+', value: '7.0+' },
  // { lebel: '7.7+', value: '7.7+' },
  // { lebel: '7.10+', value: '7.10+' },
  // { lebel: '8.0+', value: '8.0+' },
];

export default function EsDetail({ namePrefix, type, max_shard }: IFromItemBaseProps) {
  const [showMaxShard, setShowMaxShard] = useState<boolean>(true);
  return (
    <div style={{ marginBottom: '24px' }}>
      <div className='page-title' style={{ marginTop: '8px' }}>
        ES详情
      </div>
      <Form.Item label='版本' name={[...namePrefix, 'es.version']} rules={[]} initialValue='7.0+'>
        <Select
          options={versionList}
          placeholder='请选择版本'
          onChange={(val) => {
            setShowMaxShard(!['2.x', '5.x'].includes(val as string));
          }}
        ></Select>
      </Form.Item>
      {showMaxShard && (
        <Form.Item label='最大并发分片请求数' name={[...namePrefix, 'es.max_shard']} rules={[{ type: 'number', min: 0 }]} initialValue={5}>
          <InputNumber placeholder='请输入最大并发分片请求数' style={{ width: '100%' }} controls={false} />
        </Form.Item>
      )}
      <Form.Item
        label={
          <>
            <span>最小时间间隔(s)</span>
            <Tooltip title='按时间间隔自动分组的下限。建议设置为写入频率，例如，如果数据每分钟写入一次，则为1m。'>
              <InfoCircleOutlined className='ml8' />
            </Tooltip>
          </>
        }
        name={[...namePrefix, 'es.min_interval']}
        rules={[{ type: 'number', min: 0 }]}
        initialValue={10}
      >
        <InputNumber placeholder='请输入最小时间间隔' style={{ width: '100%' }} controls={false} />
      </Form.Item>
    </div>
  );
}
