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
import { Form, Radio, Select, Row, Col, InputNumber } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
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
            <Form.Item label='显示内容' name={[...namePrefix, 'textMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='valueAndName'>名称和值</Radio.Button>
                <Radio.Button value='value'>值</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='颜色模式' name={[...namePrefix, 'colorMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='value'>值</Radio.Button>
                <Radio.Button value='background'>背景</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
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
          <Col span={12}>
            <Form.Item label='每行最多显示' name={[...namePrefix, 'colSpan']}>
              <Select suffixIcon={<CaretDownOutlined />}>
                {_.map(colSpans, (item) => {
                  return (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='标题字体大小' name={[...namePrefix, 'textSize', 'title']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} min={12} max={100} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='值字体大小' name={[...namePrefix, 'textSize', 'value']}>
              <InputNumber placeholder='auto' style={{ width: '100%' }} min={12} max={100} />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
