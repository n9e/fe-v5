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
import { Button, Card, Space, Input, Form, Select } from 'antd';
import { LineChartOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { generateID } from '@/utils';
import PromGraph from '@/components/PromGraphCpt';
import AdvancedWrap from '@/components/AdvancedWrap';
import ClusterSelect from '@/pages/dashboard/Editor/QueryEditor/components/ClusterSelect';
import ElasticsearchDiscover from './ElasticsearchDiscover';
import './index.less';

type PanelMeta = { id: string; defaultPromQL?: string };

const prometheusCate = {
  value: 'prometheus',
  label: 'Prometheus',
};

const allCates = [
  prometheusCate,
  {
    value: 'elasticsearch',
    label: 'Elasticsearch',
  },
];

function getUrlParamsByName(name) {
  let reg = new RegExp(`.*?${name}=([^&]*)`),
    str = location.search || '',
    target = str.match(reg);
  if (target) {
    return target[1];
  }
  return '';
}

const Panel = ({ id, defaultPromQL, removePanel }: { id: string; defaultPromQL: string; removePanel: (id: string) => void }) => {
  const [form] = Form.useForm();
  return (
    <Card key={id} bodyStyle={{ padding: 16 }} className='panel'>
      <Form
        form={form}
        initialValues={{
          datasourceCate: 'prometheus',
          datasourceName: 'Default',
        }}
      >
        <Space align='start'>
          <Input.Group>
            <span className='ant-input-group-addon'>数据源类型</span>
            <AdvancedWrap
              var='VITE_IS_QUERY_ES_DS'
              children={(isES) => {
                return (
                  <Form.Item name='datasourceCate' noStyle>
                    <Select
                      dropdownMatchSelectWidth={false}
                      style={{ minWidth: 70 }}
                      onChange={() => {
                        form.setFieldsValue({
                          datasourceName: undefined,
                        });
                      }}
                    >
                      {_.map(isES ? allCates : [prometheusCate], (item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                );
              }}
            />
          </Input.Group>
          <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate} noStyle>
            {({ getFieldValue }) => {
              const cate = getFieldValue('datasourceCate');
              return (
                <Input.Group compact>
                  <span
                    className='ant-input-group-addon'
                    style={{
                      width: 'max-content',
                      height: 32,
                      lineHeight: '32px',
                    }}
                  >
                    关联数据源
                  </span>
                  <ClusterSelect cate={cate} />
                </Input.Group>
              );
            }}
          </Form.Item>
        </Space>
        <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate || prev.datasourceName !== curr.datasourceName} noStyle>
          {({ getFieldValue }) => {
            const datasourceCate = getFieldValue('datasourceCate');
            const datasourceName = getFieldValue('datasourceName');
            if (datasourceCate === 'prometheus') {
              return (
                <PromGraph
                  url='/api/n9e/prometheus'
                  promQL={defaultPromQL}
                  datasourceIdRequired={false}
                  datasourceName={datasourceName}
                  graphOperates={{ enabled: true }}
                  globalOperates={{ enabled: true }}
                />
              );
            } else if (datasourceCate === 'elasticsearch') {
              return <ElasticsearchDiscover datasourceName={datasourceName} form={form} />;
            }
          }}
        </Form.Item>
      </Form>
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
};

const PanelList = () => {
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
        return <Panel id={id} removePanel={removePanel} defaultPromQL={defaultPromQL} />;
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

const MetricExplorerPage = () => {
  return (
    <PageLayout title='即时查询' icon={<LineChartOutlined />} hideCluster>
      <div className='prometheus-page'>
        <PanelList />
      </div>
    </PageLayout>
  );
};

export default MetricExplorerPage;
