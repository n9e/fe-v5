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
import moment from 'moment';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import { IRawTimeRange, timeRangeUnix } from '@/components/TimeRangePicker';
import PageLayout from '@/components/pageLayout';
import { generateID } from '@/utils';
import PromGraph from '@/components/PromGraphCpt';
import './index.less';

type PanelMeta = { id: string; defaultPromQL?: string };
type IMode = 'table' | 'graph';

const PanelList = () => {
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search);
  let defaultTime: undefined | IRawTimeRange;

  if (query.start && query.end) {
    defaultTime = {
      start: moment.unix(_.toNumber(query.start)),
      end: moment.unix(_.toNumber(query.end)),
    };
  }
  const [panelList, setPanelList] = useState<PanelMeta[]>([{ id: generateID(), defaultPromQL: query.promql as string }]);
  // 添加一个查询面板
  function addPanel() {
    setPanelList(() => [
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
            <PromGraph
              url='/api/n9e/prometheus'
              type={query.mode as IMode}
              onTypeChange={(newType) => {
                history.replace({
                  pathname: '/metric/explorer',
                  search: queryString.stringify({ ...query, mode: newType }),
                });
              }}
              defaultTime={defaultTime}
              onTimeChange={(newRange) => {
                history.replace({
                  pathname: '/metric/explorer',
                  search: queryString.stringify({ ...query, ...timeRangeUnix(newRange) }),
                });
              }}
              promQL={defaultPromQL}
              datasourceIdRequired={false}
              graphOperates={{ enabled: true }}
              globalOperates={{ enabled: true }}
            />
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
