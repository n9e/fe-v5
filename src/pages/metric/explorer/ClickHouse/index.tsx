import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import moment from 'moment';
import { Radio, Row, Col, Form, Space, Button, Input, Select } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { DatasourceCateEnum } from '@/utils/constant';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { getSQLPreview } from './services';
import Raw from './Raw';
import Metric from './Metric';

interface IProps {
  datasourceCate: DatasourceCateEnum.ck;
  datasourceName: string;
  headerExtra: HTMLDivElement | null;
  form: FormInstance;
}

enum IMode {
  raw = 'raw',
  timeSeries = 'timeSeries',
}

const ModeRadio = ({ mode, setMode }) => {
  return (
    <Radio.Group
      value={mode}
      onChange={(e) => {
        setMode(e.target.value);
      }}
      buttonStyle='solid'
    >
      <Radio.Button value='timeSeries'>时序值</Radio.Button>
      <Radio.Button value='raw'>日志原文</Radio.Button>
    </Radio.Group>
  );
};

export default function index(props: IProps) {
  const { datasourceCate, datasourceName, headerExtra, form } = props;
  const [mode, setMode] = useState<IMode>(IMode.timeSeries);
  const [sqlPreview, setSqlPreview] = useState<string>('');
  const rawRef = useRef<any>();
  const metricRef = useRef<any>();
  const onExecute = () => {
    form.validateFields().then((values) => {
      const { query } = values;
      const requestParams = {
        cate: datasourceCate,
        cluster: datasourceName,
        query: [
          {
            sql: query.sql,
            time_field: query.time_field,
            time_format: query.time_format,
            from: moment(parseRange(query.range).start).unix(),
            to: moment(parseRange(query.range).end).unix(),
          },
        ],
      };
      getSQLPreview(requestParams).then((res) => {
        setSqlPreview(res?.[0]);
      });
      if (mode === 'raw') {
        if (rawRef.current && rawRef.current.fetchData) {
          rawRef.current.fetchData(datasourceCate, datasourceName, values);
        }
      }
      if (mode === 'timeSeries') {
        if (metricRef.current && metricRef.current.fetchData) {
          metricRef.current.fetchData(datasourceCate, datasourceName, values);
        }
      }
    });
  };

  return (
    <div>
      {headerExtra ? (
        createPortal(<ModeRadio mode={mode} setMode={setMode} />, headerExtra)
      ) : (
        <div style={{ marginBottom: 10 }}>
          <ModeRadio mode={mode} setMode={setMode} />
        </div>
      )}

      <Row gutter={8} style={{ marginBottom: 10 }}>
        <Col flex='auto'>
          <InputGroupWithFormItem label='SQL' labelWidth={84}>
            <Form.Item name={['query', 'sql']}>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='850px'>
          <Space style={{ display: 'flex' }}>
            <InputGroupWithFormItem label='时间字段' labelWidth={84}>
              <Form.Item name={['query', 'time_field']}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
            <InputGroupWithFormItem label='时间格式' labelWidth={84}>
              <Form.Item name={['query', 'time_format']} initialValue='datetime'>
                <Select style={{ width: 120 }}>
                  {_.map(
                    [
                      {
                        label: 'DateTime',
                        value: 'datetime',
                      },
                      {
                        label: '秒时间戳',
                        value: 'epoch_second',
                      },
                      {
                        label: '毫秒时间戳',
                        value: 'epoch_millis',
                      },
                    ],
                    (item) => {
                      return (
                        <Select.Option key={item.value} value={item.value}>
                          {item.label}
                        </Select.Option>
                      );
                    },
                  )}
                </Select>
              </Form.Item>
            </InputGroupWithFormItem>
            <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
              <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' />
            </Form.Item>
            <Form.Item>
              <Button type='primary' onClick={onExecute}>
                查询
              </Button>
            </Form.Item>
          </Space>
        </Col>
        <Col span={24}>
          <Input readOnly value={`SQL预览：${sqlPreview}`} />
        </Col>
      </Row>
      {mode === 'timeSeries' && <Metric ref={metricRef} />}
      {mode === 'raw' && <Raw ref={rawRef} form={form} />}
    </div>
  );
}
