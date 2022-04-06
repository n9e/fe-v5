/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
