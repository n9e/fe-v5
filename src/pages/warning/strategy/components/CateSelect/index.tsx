import React from 'react';
import { Form, Select } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';

const typeNameMap = {
  prometheus: 'Prometheus',
  elasticsearch: 'ElasticSearch',
};

export default function index({ visible, form }) {
  const options = visible ? ['prometheus', 'elasticsearch'] : ['prometheus'];
  return (
    <Form.Item label='数据源类型' name='cate' initialValue='prometheus'>
      <Select
        suffixIcon={<CaretDownOutlined />}
        onChange={(val) => {
          const values: any = {
            cluster: [],
            prom_ql: '',
          };
          if (val === 'elasticsearch') {
            values.query = {
              values: [
                {
                  func: 'count',
                  ref: 'A',
                },
              ],
              date_field: '@timestamp',
              interval: 1,
              interval_unit: 'min',
              rules: [
                {
                  rule_op: 'AND',
                  severity: 2,
                  rule: [
                    {
                      value: 'A',
                      func: 'cur',
                      op: '>',
                    },
                  ],
                },
              ],
            };
          }
          form.setFieldsValue(values);
        }}
      >
        {options.map((item) => (
          <Select.Option key={item} value={item}>
            {typeNameMap[item]}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
