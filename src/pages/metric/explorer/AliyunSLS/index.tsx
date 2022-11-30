import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Radio, Space, Input, Switch, Button, Tooltip, Form, Row, Col } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form/Form';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import ProjectSelect from './ProjectSelect';
import LogstoreSelect from './LogstoreSelect';
import Raw from './Raw';
import Metric from './Metric';
import './style.less';

interface IProps {
  datasourceCate: DatasourceCateEnum.aliyunSLS;
  datasourceName: string;
  headerExtra: HTMLDivElement | null;
  form: FormInstance;
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
  const [mode, setMode] = useState('timeSeries');
  const rawRef = useRef<any>();
  const metricRef = useRef<any>();

  return (
    <div>
      {headerExtra ? (
        createPortal(<ModeRadio mode={mode} setMode={setMode} />, headerExtra)
      ) : (
        <div style={{ marginBottom: 10 }}>
          <ModeRadio mode={mode} setMode={setMode} />
        </div>
      )}
      <Row gutter={8}>
        <Col flex='auto'>
          <Row gutter={8}>
            <Col span={12}>
              <ProjectSelect width='100%' datasourceCate={datasourceCate} datasourceName={datasourceName} prefixName={['query']} />
            </Col>
            <Col span={12}>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const project = getFieldValue(['query', 'project']);
                  return <LogstoreSelect width='100%' datasourceCate={datasourceCate} datasourceName={datasourceName} project={project} prefixName={['query']} />;
                }}
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col flex='450px'>
          <Space style={{ display: 'flex' }}>
            <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
              <TimeRangePicker />
            </Form.Item>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ lineHeight: '32px' }}>SQL增强</div>
              <Form.Item name={['query', 'power_sql']} valuePropName='checked'>
                <Switch />
              </Form.Item>
            </div>
            <Form.Item>
              <Button
                type='primary'
                onClick={() => {
                  form.validateFields().then((values) => {
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
                }}
              >
                查询
              </Button>
            </Form.Item>
          </Space>
        </Col>
        <Col span={24}>
          <InputGroupWithFormItem
            label={
              <span>
                查询条件{' '}
                <Tooltip
                  title={
                    <a href='https://help.aliyun.com/document_detail/43772.html' target='_blank' style={{ color: '#c6b2fd' }}>
                      详细文档
                    </a>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
            labelWidth={84}
          >
            <Form.Item name={['query', 'query']} style={{ width: '100%' }}>
              <Input />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
      </Row>

      {mode === 'timeSeries' && <Metric ref={metricRef} />}
      {mode === 'raw' && <Raw ref={rawRef} />}
    </div>
  );
}
