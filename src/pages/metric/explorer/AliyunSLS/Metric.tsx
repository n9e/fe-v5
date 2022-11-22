import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Space, Form, Select, Input } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { getDsQuery } from '@/services/metric';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { parseRange } from '@/components/TimeRangePicker';

function Metric(props, ref) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    fetchData: (datasourceCate, datasourceName, values) => {
      const query = values.query;
      const requestParams = {
        cate: datasourceCate,
        cluster: datasourceName,
        query: [
          {
            project: query.project,
            logstore: query.logstore,
            from: moment(parseRange(query.range).start).unix(),
            to: moment(parseRange(query.range).end).unix(),
            lines: 500,
            offset: 0,
            reverse: false,
            power_sql: query.power_sql,
            query: query.query,
            keys: query.keys,
          },
        ],
      };
      // setLoading(true);
      console.log('requestParams', requestParams, values);
      getDsQuery(requestParams).then((res) => {
        console.log(res);
      });
    },
  }));

  return (
    <div>
      <div>
        <span
          onClick={() => {
            setOpen(!open);
          }}
          style={{ cursor: 'pointer' }}
        >
          {open ? <DownOutlined /> : <RightOutlined />} 辅助配置
        </span>
      </div>
      <div style={{ display: open ? 'block' : 'none' }}>
        <Space>
          <InputGroupWithFormItem label={<span>ValueKey</span>} labelWidth={80}>
            <Form.Item name={['query', 'keys', 'valueKey']} style={{ width: 190 }} initialValue='PV'>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
          <InputGroupWithFormItem label={<span>LabelKey</span>} labelWidth={80}>
            <Form.Item name={['query', 'keys', 'labelKey']} style={{ width: 190 }} initialValue=''>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
          <InputGroupWithFormItem label={<span>TimeKey</span>} labelWidth={80}>
            <Form.Item name={['query', 'keys', 'timeKey']} style={{ width: 190 }} initialValue='Time'>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
          <InputGroupWithFormItem label={<span>TimeFormat</span>} labelWidth={95}>
            <Form.Item name={['query', 'keys', 'timeFormat']} style={{ width: 190 }} initialValue='%H:%i:%s'>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
        </Space>
      </div>
    </div>
  );
}

export default forwardRef(Metric);
