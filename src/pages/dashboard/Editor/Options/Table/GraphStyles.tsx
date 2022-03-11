import React from 'react';
import { Form, Radio, Select, Row, Col, InputNumber, Switch, Input } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';

const colSpans = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function GraphStyles() {
  const namePrefix = ['custom'];

  return (
    <Panel header='图表样式'>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='显示表头' name={[...namePrefix, 'showHeader']} valuePropName='checked'>
              <Switch size='small' />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item label='颜色模式' name={[...namePrefix, 'colorMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='value'>值</Radio.Button>
                <Radio.Button value='background'>背景</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col> */}
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='取值计算' name={[...namePrefix, 'calc']}>
              <Select>
                {_.map(calcsOptions, (item, key) => {
                  return (
                    <Select.Option key={key} value={key}>
                      {item.name}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='groupBy' name={[...namePrefix, 'groupBy']}>
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
