import React, { useState } from 'react';
import { Form, Input, Row, Col, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import PromQLInput from '@/components/PromQLInput';
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
            <div style={{ marginBottom: 20 }}>{render(innerVariableConfig)}</div>
            <div style={{ height: 'calc(100% - 320px)', overflowY: 'auto' }}>
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
                              <Form.Item noStyle name={[name, 'refId']} />
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
                                      'X-Cluster': 'Default',
                                      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
                                    }}
                                  />
                                </Form.Item>
                              </div>
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
                  <Form.Item label={'下钻链接'} name='link'>
                    <Input />
                  </Form.Item>
                  <Form.Item label='备注' name='description'>
                    <Input.TextArea placeholder='支持 markdown' />
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
