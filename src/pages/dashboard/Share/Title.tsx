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
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import querystring from 'query-string';
import _ from 'lodash';
import { Button, Space, Dropdown, Menu, Switch } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Resolution from '@/components/Resolution';
import { TimeRangePickerWithRefresh, IRawTimeRange } from '@/components/TimeRangePicker';
import { getStepByTimeAndStep } from '../utils';
import { dashboardTimeCacheKey } from './Detail';

interface IProps {
  curCluster: string;
  clusters: string[];
  setCurCluster: (cluster: string) => void;
  dashboard: any;
  refresh: (bool?: boolean) => void;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  step: number | null;
  setStep: (step: number | null) => void;
}

export default function Title(props: IProps) {
  const { curCluster, clusters, setCurCluster, dashboard, refresh, range, setRange, step, setStep } = props;
  const history = useHistory();
  const location = useLocation();
  const query = querystring.parse(location.search);
  const { themeMode } = query;
  return (
    <div className='dashboard-detail-header'>
      <div className='dashboard-detail-header-left'>
        <div className='title'>{dashboard.name}</div>
      </div>
      <div className='dashboard-detail-header-right'>
        <Space>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            集群：
            <Dropdown
              overlay={
                <Menu selectedKeys={[curCluster]}>
                  {clusters.map((cluster) => (
                    <Menu.Item
                      key={cluster}
                      onClick={(_) => {
                        setCurCluster(cluster);
                        localStorage.setItem('curCluster', cluster);
                        refresh();
                      }}
                    >
                      {cluster}
                    </Menu.Item>
                  ))}
                </Menu>
              }
            >
              <Button>
                {curCluster} <DownOutlined />
              </Button>
            </Dropdown>
          </div>
          <TimeRangePickerWithRefresh
            localKey={dashboardTimeCacheKey}
            dateFormat='YYYY-MM-DD HH:mm:ss'
            refreshTooltip={`刷新间隔小于 step(${getStepByTimeAndStep(range, step)}s) 将不会更新数据`}
            value={range}
            onChange={setRange}
          />
          <Resolution onChange={(v) => setStep(v)} initialValue={step} />
            <Switch
              checkedChildren='dark'
              unCheckedChildren='light'
              checked={themeMode === 'dark'}
              onChange={(checked) => {
                const newQuery = _.omit(query, ['themeMode']);
                if (checked) {
                  newQuery.viewMode = 'fullscreen'
                  newQuery.themeMode = 'dark';
                }
                history.replace({
                  pathname: location.pathname,
                  search: querystring.stringify(newQuery),
                });
              }}
            />
        </Space>
      </div>
    </div>
  );
}
