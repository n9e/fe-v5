import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Radio, Space, Input, Switch, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import { getSLSFields, getSLSLogs } from '@/services/metric';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import ProjectSelect from './ProjectSelect';
import LogstoreSelect from './LogstoreSelect';
import FieldsSidebar from '../components/FieldsSidebar';
import './style.less';
import { number } from 'echarts';

interface IProps {
  datasourceCate: DatasourceCateEnum.aliyunSLS;
  datasourceName: string;
  headerExtra: HTMLDivElement | null;
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
  const { datasourceCate, datasourceName = 'sls_test', headerExtra } = props;
  const [mode, setMode] = useState('timeSeries');
  const [project, setProject] = useState('');
  const [logstore, setLogstore] = useState('');
  const [query, setQuery] = useState('');
  const [power_sql, setPower_sql] = useState<boolean>(false);
  const [range, setRange] = useState<IRawTimeRange>({ start: 'now-1h', end: 'now' });
  const [fields, setFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [logs, setLogs] = useState<{
    total: number;
    list: { [index: string]: string }[];
  }>({
    total: 0,
    list: [],
  });

  return (
    <div>
      {props.headerExtra ? (
        createPortal(<ModeRadio mode={mode} setMode={setMode} />, props.headerExtra)
      ) : (
        <div style={{ marginBottom: 10 }}>
          <ModeRadio mode={mode} setMode={setMode} />
        </div>
      )}
      <Space style={{ display: 'flex', marginBottom: 16 }}>
        <ProjectSelect datasourceCate={datasourceCate} datasourceName={datasourceName} onChange={setProject} />
        <LogstoreSelect datasourceCate={datasourceCate} datasourceName={datasourceName} project={project} onChange={setLogstore} />
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
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            style={{ width: 300 }}
          />
        </InputGroupWithFormItem>
        <Switch
          checkedChildren='开启'
          unCheckedChildren='关闭'
          checked={power_sql}
          onChange={(val) => {
            setPower_sql(val);
          }}
        />
        <TimeRangePicker value={range} />
        <Button
          type='primary'
          onClick={() => {
            const requestParams = {
              cate: datasourceCate,
              cluster: datasourceName,
              query: [
                {
                  project,
                  logstore,
                  from: moment(parseRange(range).start).unix(),
                  to: moment(parseRange(range).end).unix(),
                  lines: 500,
                  offset: 0,
                  reverse: false,
                  power_sql,
                },
              ],
            };
            getSLSFields(requestParams).then((res) => {
              setFields(res);
            });
            getSLSLogs(requestParams).then((res) => {
              setLogs(res);
            });
          }}
        >
          查询
        </Button>
      </Space>
      <div className='sls-discover-content'>
        <FieldsSidebar fields={fields} setFields={setFields} value={selectedFields} onChange={setSelectedFields} />
        <div className='sls-discover-main'></div>
      </div>
    </div>
  );
}
