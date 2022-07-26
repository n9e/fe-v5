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
import React from 'react';
import { Form, Select, Row, Col, InputNumber, Input } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import ColorPicker from '../../../Components/ColorPicker';

export default function GraphStyles() {
  const namePrefix = ['custom'];

  return (
    <Panel header='图表样式'>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='取值计算' name={[...namePrefix, 'calc']}>
              <Select suffixIcon={<CaretDownOutlined />}>
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
          <Col span={8}>
            <Form.Item label='最大值' name={[...namePrefix, 'maxValue']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label='基础颜色' name={[...namePrefix, 'baseColor']}>
              <ColorPicker />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='序列名宽度'>
              <Input.Group>
                <Form.Item noStyle name={[...namePrefix, 'serieWidth']}>
                  <InputNumber style={{ width: '100%' }} placeholder='auto' />
                </Form.Item>
                <span className='ant-input-group-addon'>%</span>
              </Input.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='排序' name={[...namePrefix, 'sortOrder']}>
              <Select>
                <Select.Option value='none'>none</Select.Option>
                <Select.Option value='asc'>asc</Select.Option>
                <Select.Option value='desc'>desc</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
