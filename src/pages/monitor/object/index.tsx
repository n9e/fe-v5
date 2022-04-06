import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { LineChartOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { Range } from '@/components/DateRangePicker';
import { IMatch } from './types';
import List from './metricViews/List';
import LabelsValues from './metricViews/LabelsValues';
import Metrics from './metricViews/Metrics';
import './style.less';

export default function index() {
  const [match, setMatch] = useState<IMatch>({
    filters: [],
    dynamicLabels: [],
    dimensionLabel: {
      label: '',
      value: [],
    },
  });
  const [range, setRange] = useState<Range>({
    num: 1,
    unit: 'hour',
    description: 'hour',
  });

  return (
    <PageLayout title='快捷视图' icon={<LineChartOutlined />}>
      <div className='n9e-metric-views'>
        <List
          onSelect={(record: IMatch) => {
            setMatch(record);
          }}
          range={range}
        />
        <LabelsValues
          range={range}
          value={match}
          onChange={(val) => {
            setMatch(val);
          }}
        />
        <Metrics range={range} setRange={setRange} match={match} />
      </div>
    </PageLayout>
  );
}
