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
import { Form, Input, Row, Col, Select, Switch, Button, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { IVariable } from './definition';
import { convertExpressionToQuery, replaceExpressionVars, stringToRegex, setVaraiableSelected } from './constant';

interface IProps {
  id: string;
  range: IRawTimeRange;
  index: number;
  data: IVariable;
  onOk: (val: IVariable) => void;
  onCancel: () => void;
}

const typeOptions = [
  {
    label: 'Query',
    value: 'query',
  },
  {
    label: 'Custom',
    value: 'custom',
  },
  {
    label: 'Text box',
    value: 'textbox',
  },
  {
    label: 'Constant',
    value: 'constant',
  },
];

function EditItem(props: IProps) {
  const { data, range, id, index, onOk, onCancel } = props;
  const [form] = Form.useForm();
  // TODO: 不太清楚这里的逻辑是干嘛的，后面找时间看下
  const handleBlur = (val?: string) => {
    const reg = data.reg;
    const expression = val || data.definition;
    if ((!reg || new RegExp('^/(.*?)/(g?i?m?y?)$').test(reg)) && expression) {
      const formData = form.getFieldsValue();
      var newExpression = replaceExpressionVars(expression, formData, index, id);
      convertExpressionToQuery(newExpression, range).then((res) => {
        const regFilterRes = res.filter((i) => !reg || !stringToRegex(reg) || (stringToRegex(reg) as RegExp).test(i));
        if (regFilterRes.length > 0) {
          setVaraiableSelected(formData.var[index].name, regFilterRes[0], id);
        }
      });
    }
  };

  return (
    <Form layout='vertical' autoComplete='off' preserve={false} form={form} initialValues={data}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label='变量名'
            name='name'
            rules={[
              { required: true, message: '请输入变量名' },
              { pattern: /^[0-9a-zA-Z_]+$/, message: '仅支持数字和字符下划线' },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label='变量类型' name='type' rules={[{ required: true, message: '请输入变量类型' }]}>
            <Select
              style={{ width: '100%' }}
              onChange={() => {
                form.setFieldsValue({
                  definition: '',
                  defaultValue: '',
                });
              }}
            >
              {_.map(typeOptions, (item) => {
                return (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.typ} noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          if (type === 'query') {
            return (
              <>
                <Form.Item
                  label={
                    <span>
                      变量定义{' '}
                      <QuestionCircleOutlined
                        style={{ marginLeft: 5 }}
                        onClick={() => window.open('https://grafana.com/docs/grafana/latest/datasources/prometheus/#query-variable', '_blank')}
                      />
                    </span>
                  }
                  name='definition'
                  rules={[{ required: true, message: '请输入变量定义' }]}
                >
                  <Input onBlur={(e) => handleBlur(e.target.value)} />
                </Form.Item>
                <Form.Item label='筛选正则' name='reg' rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: '格式不对' }]}>
                  <Input placeholder='/*.hna/' onBlur={() => handleBlur()} />
                </Form.Item>
              </>
            );
          } else if (type === 'textbox') {
            return (
              <Form.Item label='默认值' name='defaultValue'>
                <Input onBlur={() => handleBlur()} />
              </Form.Item>
            );
          } else if (type === 'custom') {
            return (
              <Form.Item label='逗号分割的自定义值' name='definition' rules={[{ required: true, message: '请输入自定义值' }]}>
                <Input onBlur={() => handleBlur()} placeholder='1,10' />
              </Form.Item>
            );
          } else if (type === 'constant') {
            return (
              <Form.Item label='常量值' name='definition' tooltip='定义一个隐藏的常量值' rules={[{ required: true, message: '请输入常量值' }]}>
                <Input onBlur={() => handleBlur()} />
              </Form.Item>
            );
          }
        }}
      </Form.Item>
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.typ} noStyle>
        {({ getFieldValue }) => {
          const type = getFieldValue('type');
          if (type === 'query' || type === 'custom') {
            return (
              <Row gutter={16}>
                <Col flex='70px'>
                  <Form.Item label='多选' name='multi' valuePropName='checked'>
                    <Switch />
                  </Form.Item>
                </Col>
                <Col flex='70px'>
                  <Form.Item label='包含全选' name='allOption' valuePropName='checked'>
                    <Switch />
                  </Form.Item>
                </Col>
                <Col flex='auto'>
                  <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.typ} noStyle>
                    {({ getFieldValue }) => {
                      const allOption = getFieldValue('allOption');
                      if (allOption) {
                        return (
                          <Form.Item label='自定义全选值' name='allValue'>
                            <Input placeholder='.*' />
                          </Form.Item>
                        );
                      }
                    }}
                  </Form.Item>
                </Col>
              </Row>
            );
          }
        }}
      </Form.Item>
      <Form.Item>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((res) => {
                onOk(res);
              });
            }}
          >
            保存
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default EditItem;
