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
import React, { useState } from 'react';
import { Button, Card } from 'antd';
import { LineChartOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { generateID } from '@/utils';
import PromGraph from '@/components/PromGraph';
import './index.less';

type PanelMeta = { id: string; defaultPromQL?: string };

function getUrlParamsByName(name) {
  let reg = new RegExp(`.*?${name}=([^&]*)`),
    str = location.search || '',
    target = str.match(reg);
  if (target) {
    return target[1];
  }
  return '';
}

const PanelList: React.FC = () => {
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
      {panelList.map(({ id, defaultPromQL = '' }) => {
        return (
          <Card key={id} bodyStyle={{ padding: 16 }} className='panel'>
            <PromGraph url='/api/n9e/prometheus' promQL={defaultPromQL} datasourceIdRequired={false} />
            <span
              className='remove-panel-btn'
              onClick={() => {
                removePanel(id);
              }}
            >
              <CloseCircleOutlined />
            </span>
          </Card>
        );
      })}
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
  const [rerenderFlag, setRerenderFlag] = useState(_.uniqueId('rerenderFlag_'));

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
        <PanelList />
      </div>
    </PageLayout>
  );
};

export default MetricExplorerPage;
