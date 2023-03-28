import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useLocation } from 'react-router-dom';
import { Form, Radio, Space, Button } from 'antd';
import TimeRangePicker from '@/components/TimeRangePicker';
import Metrics from './Metrics';
import ItemIDs from './ItemIDs';
import Text from './Text';
import Timeseries from './Timeseries';
import Table from './Table';
import { Item } from '../types';
import './style.less';

interface ExplorerProps {
  datasourceCate: string;
  datasourceName: string;
  headerExtra: HTMLDivElement | null;
  form: any;
}

const ModeRadio = ({ mode, setMode, subMode, setSubMode }) => {
  const { t } = useTranslation();
  return (
    <Space>
      <Radio.Group
        value={mode}
        onChange={(e) => {
          setMode(e.target.value);
        }}
        buttonStyle='solid'
      >
        <Radio.Button value='timeseries'>{t('时序值')}</Radio.Button>
        <Radio.Button value='text'>{t('文本值')}</Radio.Button>
      </Radio.Group>
      {mode === 'timeseries' && (
        <Radio.Group
          value={subMode}
          onChange={(e) => {
            setSubMode(e.target.value);
          }}
          buttonStyle='solid'
        >
          <Radio.Button value='metrics'>{t('条件查询')}</Radio.Button>
          <Radio.Button value='itemIDs'>{t('ID 查询')}</Radio.Button>
        </Radio.Group>
      )}
    </Space>
  );
};

export default function Explorer(props: ExplorerProps) {
  const { t } = useTranslation();
  const params = new URLSearchParams(useLocation().search);
  const executeAtOnce = params.get('data_source_name') && params.get('data_source_type')?.includes('zabbix');
  const { datasourceCate, datasourceName, headerExtra, form } = props;
  const [mode, setMode] = useState('timeseries');
  const [subMode, setSubMode] = useState('metrics');
  const timeseriesRef = useRef<any>();
  const tableRef = useRef<any>();
  const renderExecute = (items?: Item[]) => {
    return (
      <Space size={10}>
        <Form.Item
          name={['query', 'range']}
          initialValue={{
            start: 'now-1h',
            end: 'now',
          }}
        >
          <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' allowClear />
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            onClick={() => {
              onExecute(items);
            }}
          >
            {t('查询')}
          </Button>
        </Form.Item>
      </Space>
    );
  };
  const onExecute = (items?: Item[]) => {
    form.validateFields().then((values) => {
      if (mode === 'timeseries') {
        if (timeseriesRef.current && timeseriesRef.current.fetchData) {
          timeseriesRef.current.fetchData(datasourceCate, datasourceName, values);
        }
      } else if (mode === 'text') {
        if (tableRef.current && tableRef.current.fetchData) {
          tableRef.current.fetchData(datasourceCate, datasourceName, values, items);
        }
      }
    });
  };

  useEffect(() => {
    setTimeout(() => {
      executeAtOnce && onExecute();
    }, 0);
  }, []);

  return (
    <div>
      {headerExtra ? (
        createPortal(<ModeRadio mode={mode} setMode={setMode} subMode={subMode} setSubMode={setSubMode} />, headerExtra)
      ) : (
        <div
          style={{
            marginBottom: 10,
          }}
        >
          <ModeRadio mode={mode} setMode={setMode} subMode={subMode} setSubMode={setSubMode} />
        </div>
      )}
      {mode === 'timeseries' && subMode === 'metrics' && <Metrics datasourceCate={datasourceCate} datasourceName={datasourceName} renderExecute={renderExecute} />}
      {mode === 'timeseries' && subMode === 'itemIDs' && <ItemIDs renderExecute={renderExecute} />}
      {mode === 'text' && <Text datasourceCate={datasourceCate} datasourceName={datasourceName} renderExecute={renderExecute} />}
      {mode === 'timeseries' && <Timeseries ref={timeseriesRef} />}
      {mode === 'text' && <Table ref={tableRef} />}
    </div>
  );
}
