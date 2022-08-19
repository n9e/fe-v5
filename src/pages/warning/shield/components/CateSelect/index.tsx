import React from 'react';
import { Form, Select } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { isAdvanced, isEnhanced } from '@/components/AdvancedWrap';

const typeNameMap = {
  prometheus: 'Prometheus',
  elasticsearch: 'ElasticSearch',
};

export default function index({ form }) {
  const options = isAdvanced || isEnhanced ? ['prometheus', 'elasticsearch'] : ['prometheus'];
  return (
    <Form.Item label='数据源类型' name='cate'>
      <Select
        suffixIcon={<CaretDownOutlined />}
        onChange={(val) => {
          const values: any = {
            cluster: [],
          };
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
