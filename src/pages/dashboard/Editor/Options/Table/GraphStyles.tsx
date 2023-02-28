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
import { Form, Select, Row, Col, Switch, Radio } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import { calcsOptions } from '../../config';
import { useGlobalState } from '../../../globalState';
import { useTranslation } from "react-i18next";
export default function GraphStyles({
  chartForm
}) {
  const {
    t
  } = useTranslation();
  const namePrefix = ['custom'];
  const [tableFields] = useGlobalState('tableFields');
  return <Panel header={t("图表样式")}>
      <>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t("显示表头")} name={[...namePrefix, 'showHeader']} valuePropName='checked'>
              <Switch size='small' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("颜色模式")} name={[...namePrefix, 'colorMode']}>
              <Radio.Group buttonStyle='solid'>
                <Radio.Button value='value'>{t("值")}</Radio.Button>
                <Radio.Button value='background'>{t("背景")}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t("取值计算")} name={[...namePrefix, 'calc']}>
          <Select suffixIcon={<CaretDownOutlined />}>
            {_.map(calcsOptions, (item, key) => {
            const {
              t
            } = useTranslation();
            return <Select.Option key={key} value={key}>
                  {item.name}
                </Select.Option>;
          })}
          </Select>
        </Form.Item>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item label={t("显示模式")} name={[...namePrefix, 'displayMode']}>
              <Select suffixIcon={<CaretDownOutlined />}>
                <Select.Option value='seriesToRows'>{t("每行展示")} serie {t("的值")}值</Select.Option>
                <Select.Option value='labelsOfSeriesToRows'>{t("每行展示")} labels {t("的值")}值</Select.Option>
                <Select.Option value='labelValuesToRows'>{t("每行展示指定聚合维度的值")}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
            {({
            getFieldValue
          }) => {
            if (getFieldValue([...namePrefix, 'displayMode']) === 'labelsOfSeriesToRows') {
              return <Col span={12}>
                    <Form.Item label={t("显示列")} name={[...namePrefix, 'columns']}>
                      <Select mode='multiple' placeholder={t("默认全选")} suffixIcon={<CaretDownOutlined />}>
                        {_.map(_.concat(tableFields, 'value'), item => {
                      return <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>;
                    })}
                      </Select>
                    </Form.Item>
                  </Col>;
            }

            if (getFieldValue([...namePrefix, 'displayMode']) === 'labelValuesToRows') {
              return <Col span={12}>
                    <Form.Item label={t("显示维度")} name={[...namePrefix, 'aggrDimension']}>
                      <Select suffixIcon={<CaretDownOutlined />}>
                        {_.map(tableFields, item => {
                      return <Select.Option key={item} value={item}>
                              {item}
                            </Select.Option>;
                    })}
                      </Select>
                    </Form.Item>
                  </Col>;
            }

            return null;
          }}
          </Form.Item>
        </Row>
        <Row gutter={10}>
          <Col span={12}>
            <Form.Item noStyle shouldUpdate>
              {({
              getFieldValue
            }) => {
              const {
                t
              } = useTranslation();
              const displayMode = getFieldValue([...namePrefix, 'displayMode']);
              const columns = getFieldValue([...namePrefix, 'columns']) ? getFieldValue([...namePrefix, 'columns']) : _.concat(tableFields, 'value');
              const aggrDimension = getFieldValue([...namePrefix, 'aggrDimension']);
              let keys: string[] = [];

              if (displayMode === 'seriesToRows') {
                keys = ['name', 'value'];
              } else if (displayMode === 'labelsOfSeriesToRows') {
                keys = columns;
              } else if (displayMode === 'labelValuesToRows') {
                keys = [aggrDimension || 'name', 'value'];
              }

              return <Form.Item label={t("默认排序列")} name={[...namePrefix, 'sortColumn']}>
                    <Select suffixIcon={<CaretDownOutlined />} allowClear onChange={() => {
                  if (!chartForm.getFieldValue([...namePrefix, 'sortOrder'])) {
                    const customValues = chartForm.getFieldValue('custom');

                    _.set(customValues, 'sortOrder', 'ascend');

                    chartForm.setFieldsValue({
                      custom: customValues
                    });
                  }
                }}>
                      {_.map(keys, item => {
                    return <Select.Option key={item} value={item}>
                            {item}
                          </Select.Option>;
                  })}
                    </Select>
                  </Form.Item>;
            }}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t("默认排序顺序")} name={[...namePrefix, 'sortOrder']}>
              <Select suffixIcon={<CaretDownOutlined />} allowClear>
                <Select.Option value='ascend'>asc</Select.Option>
                <Select.Option value='descend'>desc</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </>
    </Panel>;
}