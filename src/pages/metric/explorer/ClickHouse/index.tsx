import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import moment from 'moment';
import { Radio, Row, Col, Form, Space, Button, Input, Select, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
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
          <InputGroupWithFormItem
            label={
              <Space>
                <span>SQL</span>
                <Tooltip title='SQL：查询数据的SQL语句，例如：select count() AS cnt, event_time, type from system.query_log GROUP BY type, event_time'>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            labelWidth={84}
          >
            <Form.Item name={['query', 'sql']} rules={[{ required: true, message: '请输入 SQL' }]}>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='850px'>
          <Space style={{ display: 'flex' }}>
            <InputGroupWithFormItem
              label={
                <Space>
                  <span>时间字段</span>
                  <Tooltip
                    title={
                      mode === 'timeSeries'
                        ? 'SQL中代表时间的字段，该字段会作为数据的查询范围和时序数据的时间'
                        : 'SQL中代表时间的字段，如果该字段不会空，会作为查询条件拼接到查询语句中。如果该字段为空，则需要在SQL中自行处理查询范围，避免查全表数据量过大导致系统异常'
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Space>
              }
              labelWidth={90}
            >
              <Form.Item name={['query', 'time_field']} rules={[{ required: true, message: '请输入时间字段' }]}>
                <Input />
              </Form.Item>
            </InputGroupWithFormItem>
            <InputGroupWithFormItem label='时间格式' labelWidth={84}>
              <Form.Item name={['query', 'time_format']} initialValue='datetime'>
                <Select style={{ width: 120 }} allowClear>
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
              <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' allowClear />
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
