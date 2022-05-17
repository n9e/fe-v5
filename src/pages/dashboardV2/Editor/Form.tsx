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
import React, { useState } from 'react';
import { Form, Input, Row, Col, Button, Space, Switch, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import PromQLInput from '@/components/PromQLInput';
import DateRangePicker from '@/components/DateRangePicker';
import Resolution from '@/components/Resolution';
import { defaultValues, defaultCustomValuesMap } from './config';
import Options from './Options';
import Collapse, { Panel } from './Components/Collapse';
import VariableConfig, { VariableType } from '../VariableConfig';
import getFirstUnusedLetter from '../Renderer/utils/getFirstUnusedLetter';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function FormCpt(props) {
  const { chartForm, setChangedFlag, initialValues, type, variableConfig, cluster, render, range, id } = props;
  const [innerVariableConfig, setInnerVariableConfig] = useState<VariableType | undefined>(variableConfig);

  defaultValues.custom = defaultCustomValuesMap[_.get(initialValues, 'type') || defaultValues.type];

  return (
    <Form
      layout='vertical'
      form={chartForm}
      initialValues={_.merge({}, defaultValues, initialValues)}
      onValuesChange={() => {
        setChangedFlag(_.uniqueId('xxx_'));
      }}
    >
      <div
        style={{
          height: 'calc(100vh - 173px)',
        }}
      >
        <Row
          gutter={20}
          style={{
            flexWrap: 'nowrap',
            height: '100%',
          }}
        >
          <Col flex={1} style={{ minWidth: 100 }}>
            <div style={{ marginBottom: 10 }}>{render(innerVariableConfig)}</div>
            <div style={{ height: 'calc(100% - 310px)', overflowY: 'auto' }}>
              <div style={{ marginBottom: 10 }}>
                <VariableConfig
                  onChange={(value) => {
                    setInnerVariableConfig(value);
                  }}
                  value={innerVariableConfig}
                  editable={false}
                  cluster={cluster}
                  range={range}
                  id={id}
                />
              </div>
              <Form.List name='targets'>
                {(fields, { add, remove }, { errors }) => {
                  return (
                    <>
                      <Collapse>
                        {_.map(fields, ({ name }, index) => {
                          return (
                            <Panel
                              header={
                                <Form.Item noStyle shouldUpdate>
                                  {({ getFieldValue }) => {
                                    return getFieldValue(['targets', name, 'refId']) || alphabet[index];
                                  }}
                                </Form.Item>
                              }
                              key={index}
                              extra={
                                <div>
                                  {fields.length > 1 ? (
                                    <DeleteOutlined
                                      style={{ marginLeft: 10 }}
                                      onClick={() => {
                                        remove(name);
                                      }}
                                    />
                                  ) : null}
                                </div>
                              }
                            >
                              <Form.Item noStyle name={[name, 'refId']}>
                                <div />
                              </Form.Item>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Form.Item
                                  label='PromQL'
                                  name={[name, 'expr']}
                                  validateTrigger={['onBlur']}
                                  rules={[
                                    {
                                      required: true,
                                      message: '请输入PromQL',
                                    },
                                  ]}
                                  style={{ flex: 1 }}
                                >
                                  <PromQLInput
                                    url='/api/n9e/prometheus'
                                    headers={{
                                      'X-Cluster': localStorage.getItem('curCluster') || 'DEFAULT',
                                      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
                                    }}
                                  />
                                </Form.Item>
                              </div>
                              <Row gutter={10}>
                                <Col flex='auto'>
                                  <Form.Item
                                    label='Legend'
                                    name={[name, 'legend']}
                                    tooltip={{
                                      getPopupContainer: () => document.body,
                                      title:
                                        'Controls the name of the time series, using name or pattern. For example {{hostname}} will be replaced with label value for the label hostname.',
                                    }}
                                  >
                                    <Input />
                                  </Form.Item>
                                </Col>
                                <Col flex='116px'>
                                  <Form.Item
                                    label='时间选择'
                                    name={[name, 'time']}
                                    tooltip={{
                                      getPopupContainer: () => document.body,
                                      title: '可指定时间范围，默认为大盘全局时间范围',
                                    }}
                                  >
                                    <DateRangePicker nullable />
                                  </Form.Item>
                                </Col>
                                <Col flex='72px'>
                                  <Form.Item
                                    label='Step'
                                    name={[name, 'step']}
                                    tooltip={{
                                      getPopupContainer: () => document.body,
                                      title: '可指定 step，默认为大盘全局 step',
                                    }}
                                  >
                                    <Resolution />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </Panel>
                          );
                        })}

                        <Form.ErrorList errors={errors} />
                      </Collapse>
                      <Button
                        style={{ width: '100%', marginTop: 10 }}
                        onClick={() => {
                          add({ expr: '', refId: getFirstUnusedLetter(_.map(chartForm.getFieldValue('targets'), 'refId')) });
                        }}
                      >
                        + add query
                      </Button>
                    </>
                  );
                }}
              </Form.List>
            </div>
          </Col>
          <Col flex='600px' style={{ overflowY: 'auto' }}>
            <Collapse>
              <Panel header='面板配置'>
                <>
                  <Form.Item
                    label={'标题'}
                    name='name'
                    rules={[
                      {
                        required: true,
                        message: '图表名称',
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item label={'下钻链接'}>
                    <Form.List name={'links'}>
                      {(fields, { add, remove }) => (
                        <>
                          <Button
                            style={{ width: '100%', marginBottom: 10 }}
                            onClick={() => {
                              add({});
                            }}
                          >
                            添加
                          </Button>
                          {fields.map(({ key, name, ...restField }) => {
                            return (
                              <Space
                                key={key}
                                style={{
                                  alignItems: 'flex-start',
                                }}
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, 'title']}
                                  rules={[
                                    {
                                      required: true,
                                      message: '链接名称',
                                    },
                                  ]}
                                >
                                  <Input placeholder='链接名称' />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'url']}
                                  rules={[
                                    {
                                      required: true,
                                      message: '链接地址',
                                    },
                                  ]}
                                >
                                  <Input style={{ width: 260 }} placeholder='链接地址' />
                                </Form.Item>
                                <Tooltip title='是否新窗口打开'>
                                  <Form.Item {...restField} name={[name, 'targetBlank']} valuePropName='checked'>
                                    <Switch />
                                  </Form.Item>
                                </Tooltip>
                                <Button
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    remove(name);
                                  }}
                                />
                              </Space>
                            );
                          })}
                        </>
                      )}
                    </Form.List>
                    <Form.Item label='备注' name='description'>
                      <Input.TextArea placeholder='支持 markdown' />
                    </Form.Item>
                  </Form.Item>
                </>
              </Panel>
              <Form.Item shouldUpdate={(prevValues, curValues) => !_.isEqual(prevValues.targets, curValues.targets)}>
                {({ getFieldValue }) => {
                  return <Options type={type} targets={getFieldValue('targets')} />;
                }}
              </Form.Item>
            </Collapse>
          </Col>
        </Row>
      </div>
    </Form>
  );
}
