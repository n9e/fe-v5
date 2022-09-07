import React, { createContext, useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Radio, Space } from 'antd';
import PageLayout from '@/components/pageLayout';
import './index.less';
import TimeSeriesSource from '@/Packages/Settings/pages/TimeSeriesSource';
import EventSource from './EventSource';
import LogSource from '@/Packages/Settings/pages/LogSource';
import RadioButtons from '@/components/RadioButtons';
import { useParams } from 'react-router';
import TracingSource from './TracingSource';

export const urlPrefix = 'settings';

export default function index() {
  const history = useHistory();
  const { type } =
    useParams<{
      type: 'timeseries' | 'event' | 'log' | 'tracing';
    }>();

  return (
    <PageLayout title={<div>数据源管理</div>}>
      <div className='srm'>
        <Space style={{ marginBottom: 10 }}>
          <RadioButtons onChange={(e) => history.push('/settings/source/' + e.target.value)} value={type}>
            <Radio.Button value={'timeseries'}>时序数据源</Radio.Button>
            <Radio.Button value={'event'}>事件源</Radio.Button>
            <Radio.Button value={'log'}>日志源</Radio.Button>
            <Radio.Button value={'tracing'}>Tracing源</Radio.Button>
          </RadioButtons>
        </Space>
        {type === 'timeseries' && <TimeSeriesSource />}
        {type === 'event' && <EventSource />}
        {type === 'log' && <LogSource />}
        {type === 'tracing' && <TracingSource />}
      </div>
    </PageLayout>
  );
}
