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
import PageLayout from '@/components/pageLayout';
import { LineChartOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { Button } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import './index.less';
import { generateID } from '@/utils';
import { getMetrics } from '@/services/warning';
import Panel from './panel';

type PanelMeta = { id: string; defaultPromQL?: string };

interface PanelListProps {
  metrics: string[];
}

function getUrlParamsByName(name) {
  let reg = new RegExp(`.*?${name}=([^&]*)`),
    str = location.search || '',
    target = str.match(reg);
  if (target) {
    return target[1];
  }
  return '';
}

const PanelList: React.FC<PanelListProps> = ({ metrics }) => {
  const [panelList, setPanelList] = useState<PanelMeta[]>([{ id: generateID(), defaultPromQL: decodeURIComponent(getUrlParamsByName('promql')) }]);
  // 添加一个查询面板
  function addPanel() {
    setPanelList((a) => [
      ...panelList,
      {
        id: generateID(),
      },
    ]);
  }

  // 删除指定查询面板
  function removePanel(id) {
    setPanelList(panelList.reduce<PanelMeta[]>((acc, panel) => (panel.id !== id ? [...acc, { ...panel }] : acc), []));
  }

  return (
    <>
      {panelList.map(({ id, defaultPromQL = '' }) => (
        <Panel key={id} metrics={metrics} defaultPromQL={defaultPromQL} removePanel={() => removePanel(id)} />
      ))}
      <div className='add-prometheus-panel'>
        <Button size='large' onClick={addPanel}>
          <PlusOutlined />
          新增一个查询面板
        </Button>
      </div>
    </>
  );
};

const MetricExplorerPage: React.FC = () => {
  const [metrics, setMetrics] = useState<string[]>([]);
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const [rerenderFlag, setRerenderFlag] = useState(_.uniqueId('rerenderFlag_'));

  useEffect(() => {
    if (clusters.length) {
      getMetrics().then((res) => {
        setMetrics(res.data || []);
      });
    }
  }, [clusters, rerenderFlag]);

  return (
    <PageLayout
      title='即时查询'
      icon={<LineChartOutlined />}
      hideCluster={false}
      onChangeCluster={() => {
        setRerenderFlag(_.uniqueId('rerenderFlag_'));
      }}
    >
      <div className='prometheus-page' key={rerenderFlag}>
        <PanelList metrics={metrics} />
      </div>
    </PageLayout>
  );
};

export default MetricExplorerPage;
