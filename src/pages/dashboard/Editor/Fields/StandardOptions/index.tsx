import React from 'react';
import { Collapse, Form, Radio, Select, InputNumber } from 'antd';
import _ from 'lodash';

const { Panel } = Collapse;
const { Option, OptGroup } = Select;

export default function index(props) {
  const namePrefix = ['options', 'standardOptions'];

  return (
    <Panel {...props} header='高级设置' key='standardOptions'>
      <div>
        <Form.Item label='单位' name={[...namePrefix, 'util']}>
          <Select>
            <OptGroup label='基础'>
              <Option value='string'>字符串</Option>
              <Option value='percent'>百分比(0-100)</Option>
              <Option value='percentUnit'>百分比(0.0-1.0)</Option>
            </OptGroup>
            <OptGroup label='Data(SI)'>
              <Option value='bitsSI'>bits(SI)</Option>
              <Option value='bytesSI'>bytes(SI)</Option>
            </OptGroup>
            <OptGroup label='Data(IEC)'>
              <Option value='bitsIEC'>bits(IEC)</Option>
              <Option value='bytesIEC'>bytes(IEC)</Option>
            </OptGroup>
          </Select>
        </Form.Item>
        <Form.Item label='最小值' name={[...namePrefix, 'min']}>
          <InputNumber />
        </Form.Item>
        <Form.Item label='最大值' name={[...namePrefix, 'max']}>
          <InputNumber />
        </Form.Item>
        <Form.Item label='小数点' name={[...namePrefix, 'decimals']}>
          <InputNumber />
        </Form.Item>
      </div>
    </Panel>
  );
}
