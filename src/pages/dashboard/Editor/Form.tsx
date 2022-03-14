import React, { useState } from 'react';
import { Form, Input, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import PromQLInput from '@/components/PromQLInput';
import { defaultValues, defaultCustomValuesMap } from './config';
import Options from './Options';
import Collapse, { Panel } from './Components/Collapse';
import VariableConfig, { VariableType } from '../VariableConfig';

export default function FormCpt(props) {
  const { chartForm, setChangedFlag, initialValues, type, variableConfig, cluster, render } = props;
  const [innerVariableConfig, setInnerVariableConfig] = useState<VariableType | undefined>(variableConfig);
  const PromqlEditorField = ({ onChange = (e: any) => {}, value = '', fields, remove, add, index, name }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <PromQLInput
          url='/api/n9e/prometheus'
          headers={{
            xCluster: 'Default',
            Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
          }}
          onChange={onChange}
          value={value}
        />
        {fields.length > 1 ? (
          <MinusCircleOutlined
            style={{ marginLeft: 10 }}
            onClick={() => {
              remove(name);
            }}
          />
        ) : null}
        {index === fields.length - 1 && (
          <PlusCircleOutlined
            style={{ marginLeft: 10 }}
            onClick={() => {
              add({ PromQL: '' });
            }}
          />
        )}
      </div>
    );
  };

  defaultValues.custom = defaultCustomValuesMap[_.get(initialValues, 'type') || defaultValues.type];

  return (
    <Form
      layout='vertical'
      form={chartForm}
      initialValues={_.merge({}, defaultValues, initialValues)}
      onValuesChange={(aa) => {
        setChangedFlag(_.uniqueId('xxx_'));
      }}
    >
      <div
        style={{
          height: 'calc(100vh - 120px)',
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
            <div style={{ height: 'calc(100% - 220px)', overflowY: 'auto' }}>
              <VariableConfig
                onChange={(value) => {
                  setInnerVariableConfig(value);
                }}
                value={innerVariableConfig}
                editable={false}
                cluster={cluster}
              />
              <Form.List name='targets'>
                {(fields, { add, remove }, { errors }) => {
                  return (
                    <>
                      <Collapse>
                        {fields.length ? (
                          fields.map(({ key, name, fieldKey, ...restField }, index) => {
                            return (
                              <Panel header={`Query ${index}`} key={index}>
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
                                >
                                  <PromqlEditorField key={name + fieldKey} name={name} fields={fields} index={index} remove={remove} add={add} />
                                </Form.Item>
                                <Form.Item
                                  label='Legend'
                                  name={[name, 'Legend']}
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
                          })
                        ) : (
                          <PlusCircleOutlined
                            onClick={() => {
                              add({
                                PromQL: '',
                              });
                            }}
                          />
                        )}
                        <Form.ErrorList errors={errors} />
                      </Collapse>
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
                </>
              </Panel>
              <Options type={type} />
            </Collapse>
          </Col>
        </Row>
      </div>
    </Form>
  );
}
