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
import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useThrottleFn } from 'ahooks';
import moment from 'moment';
import _ from 'lodash';
import { Input, Button, Space, Dropdown, Menu } from 'antd';
import { RollbackOutlined, EditOutlined, DownOutlined } from '@ant-design/icons';
import { updateDashboard } from '@/services/dashboardV2';
import DateRangePicker from '@/components/DateRangePicker';
import Resolution from '@/components/Resolution';
import { Range } from '@/components/DateRangePicker';
import Refresh from '../Components/Refresh';
import { AddPanelIcon } from '../config';
import { visualizations } from '../Editor/config';

interface IProps {
  curCluster: string;
  clusters: string[];
  setCurCluster: (cluster: string) => void;
  dashboard: any;
  setDashboard: (dashboard: any) => void;
  refresh: (bool?: boolean) => void;
  range: Range;
  setRange: (range: Range) => void;
  step: number | null;
  setStep: (step: number | null) => void;
  refreshRef: any;
  onAddPanel: (type: string) => void;
}

export default function Title(props: IProps) {
  const { curCluster, clusters, setCurCluster, dashboard, setDashboard, refresh, range, setRange, step, setStep, refreshRef, onAddPanel } = props;
  const { id, name } = dashboard;
  const history = useHistory();
  const [titleEditing, setTitleEditing] = useState(false);
  const titleRef = useRef<any>(null);
  const handleModifyTitle = async (newName) => {
    updateDashboard(id, { ...dashboard, name: newName }).then(() => {
      setDashboard({ ...dashboard, name: newName });
      setTitleEditing(false);
    });
  };
  const { run } = useThrottleFn(
    () => {
      if ('start' in range && range.start && range.end) {
        const diff = range.end - range.start;
        const now = moment().unix();
        setRange({
          end: now,
          start: now - diff,
        });
      } else if ('unit' in range && range.unit) {
        const newRefreshFlag = _.uniqueId('refreshFlag_');
        setRange({
          ...range,
          refreshFlag: newRefreshFlag,
        });
      }
      refresh(false);
    },
    { wait: 1000 },
  );

  return (
    <div className='dashboard-detail-header'>
      <div className='dashboard-detail-header-left'>
        <RollbackOutlined className='back' onClick={() => history.push(import.meta.env.VITE_PREFIX + '/dashboards')} />
        {titleEditing ? (
          <Input
            ref={titleRef}
            defaultValue={name}
            onPressEnter={(e: any) => {
              handleModifyTitle(e.target.value);
            }}
          />
        ) : (
          <div className='title'>{dashboard.name}</div>
        )}
        {!titleEditing ? (
          <EditOutlined
            className='edit'
            onClick={() => {
              setTitleEditing(!titleEditing);
            }}
          />
        ) : (
          <>
            <Button size='small' style={{ marginRight: 5, marginLeft: 5 }} onClick={() => setTitleEditing(false)}>
              取消
            </Button>
            <Button
              size='small'
              type='primary'
              onClick={() => {
                handleModifyTitle(titleRef.current.state.value);
              }}
            >
              保存
            </Button>
          </>
        )}
      </div>
      <div className='dashboard-detail-header-right'>
        <Space>
          <div>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {_.map([{ type: 'row', name: '分组' }, ...visualizations], (item) => {
                    return (
                      <Menu.Item
                        key={item.type}
                        onClick={() => {
                          onAddPanel(item.type);
                        }}
                      >
                        {item.name}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
            >
              <Button type='primary' icon={<AddPanelIcon />}>
                添加图表
              </Button>
            </Dropdown>
          </div>
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
                        refresh(true);
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
          <DateRangePicker
            value={range}
            onChange={(val) => {
              setRange(val);
            }}
          />
          <Resolution onChange={(v) => setStep(v)} initialValue={step} />
          <Refresh range={range} step={step} onRefresh={run} ref={refreshRef} />
        </Space>
      </div>
    </div>
  );
}
