import React from 'react';
import { Space, Input, Form, Select } from 'antd';
import AdvancedWrap from '@/components/AdvancedWrap';
import Prometheus from './Prometheus';
import ElasticSearch from './Elasticsearch';
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
                            index: '',
                            filters: '',
                            query: {
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
              if (getFieldValue('datasourceCate') === 'elasticsearch') {
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
            return <ElasticSearch chartForm={chartForm} />;
          }
          return null;
        }}
      </Form.Item>
    </div>
  );
}
