import React from 'react';
import { Space, Input, Form, Select } from 'antd';
import AdvancedWrap from '@/components/AdvancedWrap';
import Prometheus from './Prometheus';
import Elasticsearch from './Elasticsearch';
import ElasticsearchLog from './ElasticsearchLog';
import ClusterSelect from './components/ClusterSelect';

const cates = [
  {
    value: 'prometheus',
    label: 'Prometheus',
  },
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
      <AdvancedWrap var='VITE_IS_QUERY_ES_DS'>
        <Space style={{ marginBottom: 10 }}>
          <Input.Group>
            <span className='ant-input-group-addon'>数据源类型</span>
            <Form.Item name='datasourceCate' noStyle initialValue='prometheus'>
              <Select
                dropdownMatchSelectWidth={false}
                style={{ minWidth: 70 }}
                onChange={(val) => {
                  setTimeout(() => {
                    if (val === 'prometheus') {
                      chartForm.setFieldsValue({
                        targets: [
                          {
                            refId: 'A',
                            expr: '',
                          },
                        ],
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
                      });
                    }
                  }, 500);
                }}
              >
                {cates.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Input.Group>
          <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate} noStyle>
            {({ getFieldValue }) => {
              const cate = getFieldValue('datasourceCate') || 'prometheus';
              if (cate === 'elasticsearch' || cate === 'elasticsearch-log') {
                return (
                  <Input.Group>
                    <span className='ant-input-group-addon'>集群</span>
                    <ClusterSelect />
                  </Input.Group>
                );
              }
              return null;
            }}
          </Form.Item>
        </Space>
      </AdvancedWrap>
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
