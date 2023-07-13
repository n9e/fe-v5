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
import { calcsOptions } from '../../config';
import ColorRangeMenu from '../../../Components/ColorRangeMenu';
import { colors } from '../../../Components/ColorRangeMenu/config';
import '../../../Components/ColorRangeMenu/style.less';
import { useTranslation } from 'react-i18next';
const colSpans = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export default function GraphStyles() {
  const { t } = useTranslation();
  const namePrefix = ['custom'];
  return (
    <Panel header={t('图表样式')}>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t('显示内容')} name={[...namePrefix, 'textMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='valueAndName'>{t('名称和值')}</Radio.Button>
                <Radio.Button value='name'>{t('名称')}</Radio.Button>
                <Radio.Button value='value'>{t('值')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={10}>
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
          <Col span={10}>
            <Form.Item label={t('颜色')} name={[...namePrefix, 'colorRange']}>
              <Select suffixIcon={<CaretDownOutlined />} dropdownClassName='color-scales' optionLabelProp='label'>
                {_.map(colors, (item) => {
                  return (
                    <Select.Option key={item.value} label={item.label} value={_.join(item.value, ',')}>
                      <span className='color-scales-menu-colors'>
                        {_.map(item.value, (color) => {
                          return (
                            <span
                              key={color}
                              style={{
                                backgroundColor: color,
                              }}
                            />
                          );
                        })}
                      </span>
                      {item.label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label={t('反转颜色')} name={[...namePrefix, 'reverseColorOrder']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item label={t('自动 min/max 值')} tooltip={t('默认自动从 series 里面取 min max 值')} name={[...namePrefix, 'colorDomainAuto']} valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Col>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              if (!getFieldValue([...namePrefix, 'colorDomainAuto'])) {
                return (
                  <>
                    <Col span={8}>
                      <Form.Item label='min' name={[...namePrefix, 'colorDomain', 0]}>
                        <InputNumber
                          style={{
                            width: '100%',
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label='max' name={[...namePrefix, 'colorDomain', 1]}>
                        <InputNumber
                          style={{
                            width: '100%',
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </>
                );
              }
            }}
          </Form.Item>
        </Row>
      </>
    </Panel>
  );
}
