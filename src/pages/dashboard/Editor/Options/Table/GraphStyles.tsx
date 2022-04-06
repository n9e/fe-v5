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
import { Form, Select, Row, Col, Switch, Input } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';

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
        </Row>
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
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='显示模式' name={[...namePrefix, 'displayMode']}>
              <Select>
                <Select.Option value='seriesToRows'>每行展示 serie 的值</Select.Option>
                <Select.Option value='labelValuesToRows'>每行展示指定聚合维度的值</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
            {({ getFieldValue }) => {
              if (getFieldValue([...namePrefix, 'displayMode']) === 'labelValuesToRows') {
                return (
                  <Col span={12}>
                    <Form.Item label='显示维度' name={[...namePrefix, 'aggrDimension']}>
                      <Input />
                    </Form.Item>
                  </Col>
                );
              }
              return null;
            }}
          </Form.Item>
        </Row>
      </>
    </Panel>
  );
}
