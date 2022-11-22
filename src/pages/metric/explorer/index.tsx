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
import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Space, Input, Form, Select } from 'antd';
import { LineChartOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { generateID } from '@/utils';
import AdvancedWrap from '@/components/AdvancedWrap';
import { getCommonESClusters, getCommonClusters, getCommonSLSClusters } from '@/services/common';
import { datasourceCatesMap, DatasourceCateEnum } from '@/utils/constant';
import Elasticsearch from './Elasticsearch';
import Prometheus from './Prometheus';
import AliyunSLS from './AliyunSLS';
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

const getDefaultDatasourceName = (datasourceCate, datasourceList) => {
  const localPrometheus = localStorage.getItem('curCluster');
  const localElasticsearch = localStorage.getItem('datasource_es_name');
  if (datasourceCate === 'prometheus') return localPrometheus || _.get(datasourceList, [datasourceCate, 0]);
  if (datasourceCate === 'elasticsearch') return localElasticsearch || _.get(datasourceList, [datasourceCate, 0]);
};

const setDefaultDatasourceName = (datasourceCate, value) => {
  if (datasourceCate === 'prometheus') {
    localStorage.setItem('curCluster', value);
  }
  if (datasourceCate === 'elasticsearch') {
    localStorage.setItem('datasource_es_name', value);
  }
};

const Panel = ({
  defaultPromQL,
  removePanel,
  datasourceList,
  id,
}: {
  id: string;
  datasourceList: {
    prometheus: string[];
    elasticsearch: string[];
    'aliyun-sls': string[];
  };
  defaultPromQL: string;
  removePanel: (id: string) => void;
}) => {
  const [form] = Form.useForm();
  const headerExtraRef = useRef<HTMLDivElement>(null);

  return (
    <Card bodyStyle={{ padding: 16 }} className='panel'>
      <Form
        form={form}
        initialValues={{
          datasourceCate: DatasourceCateEnum.prometheus,
          datasourceName: getDefaultDatasourceName(DatasourceCateEnum.prometheus, datasourceList),
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
                      onChange={(val) => {
                        form.setFieldsValue({
                          datasourceName: getDefaultDatasourceName(val, datasourceList),
                        });
                      }}
                    >
                      {_.map(isES ? datasourceCatesMap.all : datasourceCatesMap.normal, (item) => (
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
                  <Form.Item
                    name='datasourceName'
                    rules={[
                      {
                        required: cate !== 'prometheus',
                        message: '请选择数据源',
                      },
                    ]}
                  >
                    <Select
                      placeholder='选择数据源'
                      style={{ minWidth: 70 }}
                      dropdownMatchSelectWidth={false}
                      onChange={(val: string) => {
                        setDefaultDatasourceName(cate, val);
                      }}
                    >
                      {_.map(datasourceList[cate], (item) => (
                        <Select.Option value={item} key={item}>
                          {item}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Input.Group>
              );
            }}
          </Form.Item>
          <div ref={headerExtraRef} />
        </Space>
        <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate || prev.datasourceName !== curr.datasourceName} noStyle>
          {({ getFieldValue }) => {
            const datasourceCate = getFieldValue('datasourceCate');
            const datasourceName = getFieldValue('datasourceName');
            if (datasourceCate === DatasourceCateEnum.prometheus) {
              return <Prometheus defaultPromQL={defaultPromQL} />;
            } else if (datasourceCate === DatasourceCateEnum.elasticsearch) {
              return <Elasticsearch datasourceName={datasourceName} form={form} />;
            } else if (datasourceCate === DatasourceCateEnum.aliyunSLS) {
              return <AliyunSLS datasourceCate={DatasourceCateEnum.aliyunSLS} datasourceName={datasourceName} headerExtra={headerExtraRef.current} form={form} />;
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
  const [datasourceList, setDatasourceList] = useState<{
    prometheus: string[];
    elasticsearch: string[];
    'aliyun-sls': string[];
  }>({
    prometheus: [],
    elasticsearch: [],
    'aliyun-sls': [],
  });

  useEffect(() => {
    const fetchDatasourceList = async () => {
      const promList = await getCommonClusters().then((res) => res.dat);
      const esList = await getCommonESClusters().then((res) => res.dat);
      const slsList = await getCommonSLSClusters().then((res) => res.dat);
      setDatasourceList({
        prometheus: promList,
        elasticsearch: esList,
        'aliyun-sls': slsList,
      });
    };
    fetchDatasourceList().catch(() => {
      setDatasourceList({
        prometheus: [],
        elasticsearch: [],
        'aliyun-sls': [],
      });
    });
  }, []);

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
    setPanelList(_.filter(panelList, (item) => item.id !== id));
  }

  return (
    <>
      {panelList.map(({ id, defaultPromQL = '' }) => {
        return <Panel key={id} id={id} removePanel={removePanel} defaultPromQL={defaultPromQL} datasourceList={datasourceList} />;
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
