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
import React, { useContext } from 'react';
import { Form, Select, Row, Col, Switch, AutoComplete } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import { Context } from '../../../Context';

export default function GraphStyles() {
  const namePrefix = ['custom'];
  const { state } = useContext(Context);

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
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label='显示模式' name={[...namePrefix, 'displayMode']}>
              <Select suffixIcon={<CaretDownOutlined />}>
                <Select.Option value='seriesToRows'>每行展示 serie 的值</Select.Option>
                <Select.Option value='labelsOfSeriesToRows'>每行展示 labels 的值</Select.Option>
                <Select.Option value='labelValuesToRows'>每行展示指定聚合维度的值</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
            {({ getFieldValue }) => {
              if (getFieldValue([...namePrefix, 'displayMode']) === 'labelsOfSeriesToRows') {
                return (
                  <Col span={12}>
                    <Form.Item label='显示列' name={[...namePrefix, 'columns']}>
                      <Select mode='multiple' placeholder='默认全选' suffixIcon={<CaretDownOutlined />}>
                        {_.map(_.concat(state.metric, 'value'), (item) => {
                          return (
                            <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                );
              }
              if (getFieldValue([...namePrefix, 'displayMode']) === 'labelValuesToRows') {
                return (
                  <Col span={12}>
                    <Form.Item label='显示维度' name={[...namePrefix, 'aggrDimension']}>
                      <Select suffixIcon={<CaretDownOutlined />}>
                        {_.map(state.metric, (item) => {
                          return (
                            <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                );
              }
              return null;
            }}
          </Form.Item>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const displayMode = getFieldValue([...namePrefix, 'displayMode']);
                const columns = getFieldValue([...namePrefix, 'columns']) ? getFieldValue([...namePrefix, 'columns']) : _.concat(state.metric, 'value');
                const aggrDimension = getFieldValue([...namePrefix, 'aggrDimension']);
                let keys: string[] = [];
                if (displayMode === 'seriesToRows') {
                  keys = ['name', 'value'];
                } else if (displayMode === 'labelsOfSeriesToRows') {
                  keys = columns;
                } else if (displayMode === 'labelValuesToRows') {
                  keys = [aggrDimension, 'value'];
                }
                return (
                  <Form.Item label='默认排序列' name={[...namePrefix, 'sortColumn']}>
                    <Select suffixIcon={<CaretDownOutlined />} allowClear>
                      {_.map(keys, (item) => {
                        return (
                          <Select.Option key={item} value={item}>
                            {item}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='默认排序顺序' name={[...namePrefix, 'sortOrder']}>
              <Select suffixIcon={<CaretDownOutlined />} allowClear>
                <Select.Option value='ascend'>asc</Select.Option>
                <Select.Option value='descend'>desc</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
