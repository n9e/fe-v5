import React from 'react';
import { Form, Radio, Select, Row, Col, InputNumber } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import { calcsOptions, legendPostion } from '../../config';

export default function GraphStyles() {
  const namePrefix = ['custom'];

  return (
    <Panel header='图表样式'>
      <>
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
            <Form.Item label='图例位置' name={[...namePrefix, 'legengPosition']}>
              <Select>
                {legendPostion.map((item) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='最多展示块数' name={[...namePrefix, 'max']} tooltip='超过的块数则合并展示为其他'>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
