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
import { Form, Radio, Select, Row, Col, InputNumber, Switch } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import { calcsOptions, legendPostion } from '../../config';
import { useTranslation } from 'react-i18next';
export default function GraphStyles() {
  const { t } = useTranslation();
  const namePrefix = ['custom'];
  return (
    <Panel header={t('图表样式')}>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t('取值计算')} name={[...namePrefix, 'calc']}>
              <Select suffixIcon={<CaretDownOutlined />}>
                {_.map(calcsOptions, (item, key) => {
                  return (
                    <Select.Option key={key} value={key}>
                      {t('item.name')}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('图例位置')} name={[...namePrefix, 'legengPosition']}>
              <Select suffixIcon={<CaretDownOutlined />}>
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
          <Col span={9}>
            <Form.Item label={t('最多展示块数')} name={[...namePrefix, 'max']} tooltip={t('超过的块数则合并展示为其他')}>
              <InputNumber
                style={{
                  width: '100%',
                }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label={t('环图模式')} name={[...namePrefix, 'donut']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('label是否包含名称')} name={[...namePrefix, 'labelWithName']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>
  );
}
