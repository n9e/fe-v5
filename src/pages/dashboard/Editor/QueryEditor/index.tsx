import React from 'react';
import { Space, Input, Form, Select } from 'antd';
import _ from 'lodash';
import AdvancedWrap from '@/components/AdvancedWrap';
import Prometheus from './Prometheus';
import Elasticsearch from './Elasticsearch';
import ElasticsearchLog from './ElasticsearchLog';
import ClusterSelect from './components/ClusterSelect';

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
  {
    value: 'elasticsearch-log',
    label: 'Elasticsearch Log',
  },
];

export default function index({ chartForm }) {
  return (
    <div>
      <Space style={{ marginBottom: 10 }}>
        <Input.Group>
          <span className='ant-input-group-addon'>数据源类型</span>
          <AdvancedWrap
            var='VITE_IS_QUERY_ES_DS'
            children={(isES) => {
              return (
                <Form.Item name='datasourceCate' noStyle initialValue='prometheus'>
                  <Select
                    dropdownMatchSelectWidth={false}
                    style={{ minWidth: 70 }}
                    onChange={(val) => {
                      // TODO: 调整数据源类型后需要重置配置
                      setTimeout(() => {
                        if (val === 'prometheus') {
                          chartForm.setFieldsValue({
                            targets: [
                              {
                                refId: 'A',
                                expr: '',
                              },
                            ],
                            datasourceName: undefined,
                          });
                        } else if (val === 'elasticsearch') {
                          chartForm.setFieldsValue({
                            targets: [
                              {
                                refId: 'A',
                                query: {
                                  index: '',
                                  filters: '',
                                  values: [
                                    {
                                      func: 'count',
                                    },
                                  ],
                                  date_field: '@timestamp',
                                  interval: 1,
                                  interval_unit: 'min',
                                },
                              },
                            ],
                            datasourceName: undefined,
                          });
                        } else if (val === 'elasticsearch-log') {
                          chartForm.setFieldsValue({
                            targets: [
                              {
                                refId: 'A',
                                query: {
                                  date_field: '@timestamp',
                                  limit: 10,
                                },
                              },
                            ],
                            datasourceName: undefined,
                          });
                        }
                      }, 500);
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
            const cate = getFieldValue('datasourceCate') || 'prometheus';
            return (
              <Input.Group>
                <span className='ant-input-group-addon'>集群</span>
                <ClusterSelect cate={cate} />
              </Input.Group>
            );
          }}
        </Form.Item>
      </Space>
      <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate} noStyle>
        {({ getFieldValue }) => {
          const cate = getFieldValue('datasourceCate') || 'prometheus';
          if (cate === 'prometheus') {
            return <Prometheus chartForm={chartForm} />;
          }
          if (cate === 'elasticsearch') {
            return <Elasticsearch chartForm={chartForm} />;
          }
          if (cate === 'elasticsearch-log') {
            return <ElasticsearchLog chartForm={chartForm} />;
          }
          return null;
        }}
      </Form.Item>
    </div>
  );
}
