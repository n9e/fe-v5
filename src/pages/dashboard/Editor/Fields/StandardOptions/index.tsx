import React from 'react';
import { Form, Select, InputNumber, Row, Col } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';

const { Option, OptGroup } = Select;

export default function index() {
  const namePrefix = ['options', 'standardOptions'];

  return (
    <Panel header='高级设置'>
      <>
        <Form.Item label='单位' name={[...namePrefix, 'util']}>
          <Select placeholder='none' allowClear>
            <OptGroup label='Data(SI)'>
              <Option value='bitsSI'>bits(SI)</Option>
              <Option value='bytesSI'>bytes(SI)</Option>
            </OptGroup>
            <OptGroup label='Data(IEC)'>
              <Option value='bitsIEC'>bits(IEC)</Option>
              <Option value='bytesIEC'>bytes(IEC)</Option>
            </OptGroup>
            <OptGroup label='百分比'>
              <Option value='percent'>百分比(0-100)</Option>
              <Option value='percentUnit'>百分比(0.0-1.0)</Option>
            </OptGroup>
          </Select>
        </Form.Item>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label='最小值' name={[...namePrefix, 'min']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='最大值' name={[...namePrefix, 'max']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='小数点' name={[...namePrefix, 'decimals']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
