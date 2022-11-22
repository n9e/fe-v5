import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Radio, Space, Input, Switch, Button, Tooltip, Form } from 'antd';
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
      <Space style={{ display: 'flex' }}>
        <ProjectSelect datasourceCate={datasourceCate} datasourceName={datasourceName} />
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const project = getFieldValue(['query', 'project']);
            return <LogstoreSelect datasourceCate={datasourceCate} datasourceName={datasourceName} project={project} />;
          }}
        </Form.Item>
        <InputGroupWithFormItem
          label={
            <span>
              查询条件{' '}
              <Tooltip title=''>
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          labelWidth={90}
        >
          <Form.Item
            name={['query', 'query']}
            style={{ width: 300 }}
            initialValue={`* | select time_series(__time__, '1m', '%H:%i:%s' ,'0') as Time, count(1) as PV   group by Time order by Time limit 100`}
          >
            <Input />
          </Form.Item>
        </InputGroupWithFormItem>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ lineHeight: '32px' }}>SQL增强</div>
          <Form.Item name={['query', 'power_sql']} valuePropName='checked'>
            <Switch />
          </Form.Item>
        </div>
        <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
          <TimeRangePicker />
        </Form.Item>
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
      {mode === 'timeSeries' && <Metric ref={metricRef} />}
      {mode === 'raw' && <Raw ref={rawRef} />}
    </div>
  );
}
