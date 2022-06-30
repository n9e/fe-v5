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
import { Modal, Form, Input, Button, Row, Col, Switch, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Range } from '@/components/DateRangePicker';
import { IVariable } from './definition';
import { convertExpressionToQuery, replaceExpressionVars, stringToRegex, setVaraiableSelected } from './constant';

interface Props {
  id: string;
  visible: boolean;
  value?: IVariable[];
  range: Range;
  onChange: (v?: IVariable[]) => void;
}
export default function EditItem(props: Props) {
  const { visible, onChange, value, range, id } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const handleOk = async () => {
    await form.validateFields();
    const v = form.getFieldsValue();
    onChange(v.var);
  };
  const onCancel = () => {
    onChange();
  };

  const handleBlur = (index) => {
    const reg = form.getFieldValue(['var', index, 'reg']);
    const expression = form.getFieldValue(['var', index, 'definition']);
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
    <Modal title={t('大盘变量')} width={950} visible={visible} onOk={handleOk} onCancel={onCancel} wrapClassName='variable-modal'>
      <Form
        autoComplete='off'
        preserve={false}
        form={form}
        initialValues={{
          var: value,
        }}
      >
        <Row gutter={[6, 6]} className='tag-header'>
          <Col span={3}>{t('类型')}</Col>
          <Col span={4}>{t('变量名')}</Col>
          <Col span={5}>
            {t('变量定义')}
            <QuestionCircleOutlined
              style={{ marginLeft: 5 }}
              onClick={() => window.open('https://grafana.com/docs/grafana/latest/datasources/prometheus/#query-variable', '_blank')}
            />
          </Col>
          <Col span={4}>{t('筛值正则')}</Col>
          <Col span={2}>{t('Multi')}</Col>
          <Col span={2}>{t('All Option')}</Col>
          <Col span={4}>{t('操作')}</Col>
        </Row>
        <Form.List name='var'>
          {(fields, { add, remove, move }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Row gutter={[6, 6]} className='tag-content-item' key={key}>
                  <Col span={3}>
                    <Form.Item {...restField} name={[name, 'type']} fieldKey={[fieldKey, 'type']} rules={[{ required: true, message: t('请选择变量类型') }]}>
                      <Select style={{ width: '100%' }}>
                        <Select.Option value='query'>Query</Select.Option>
                        <Select.Option value='textbox'>Text box</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      fieldKey={[fieldKey, 'name']}
                      rules={[
                        { required: true, message: t('请输入变量名') },
                        { pattern: /^[0-9a-zA-Z_]+$/, message: t('仅支持数字和字符下划线') },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const type = getFieldValue(['var', fieldKey, 'type']);
                        if (type === 'query') {
                          return (
                            <Form.Item
                              {...restField}
                              name={[name, 'definition']}
                              fieldKey={[fieldKey, 'definition']}
                              rules={[
                                { required: true, message: t('请输入变量定义') },
                                {
                                  validator(_, value) {
                                    if (/^\s*label_values.+,\s*\$.+/.test(value)) {
                                      return Promise.reject(new Error('label_values表达式的label不允许使用变量'));
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <Input onBlur={(v) => handleBlur(name)} />
                            </Form.Item>
                          );
                        }
                        return (
                          <Form.Item {...restField} name={[name, 'defaultValue']} fieldKey={[fieldKey, 'defaultValue']}>
                            <Input onBlur={(v) => handleBlur(name)} placeholder='默认值' />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const type = getFieldValue(['var', fieldKey, 'type']);
                        if (type === 'query') {
                          return (
                            <Form.Item
                              {...restField}
                              name={[name, 'reg']}
                              fieldKey={[fieldKey, 'reg']}
                              rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: t('格式不对') }]}
                            >
                              <Input placeholder='/*.hna/' onBlur={(v) => handleBlur(name)} />
                            </Form.Item>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const type = getFieldValue(['var', fieldKey, 'type']);
                        if (type === 'query') {
                          return (
                            <Form.Item {...restField} name={[name, 'multi']} fieldKey={[fieldKey, 'multi']} valuePropName='checked'>
                              <Switch />
                            </Form.Item>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const type = getFieldValue(['var', fieldKey, 'type']);
                        if (type === 'query' && form.getFieldValue(['var', name, 'multi'])) {
                          return (
                            <Form.Item {...restField} name={[name, 'allOption']} fieldKey={[fieldKey, 'allOption']} valuePropName='checked'>
                              <Switch />
                            </Form.Item>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Button type='link' size='small' onClick={() => move(name, name + 1)} disabled={name === fields.length - 1}>
                      <ArrowDownOutlined />
                    </Button>
                    <Button type='link' size='small' onClick={() => move(name, name - 1)} disabled={name === 0}>
                      <ArrowUpOutlined />
                    </Button>
                    <Button
                      type='link'
                      size='small'
                      onClick={() => {
                        const v = form.getFieldValue(['var', name]);
                        add({ ...v, name: 'copy_of_' + v.name });
                      }}
                    >
                      <CopyOutlined />
                    </Button>
                    <Button type='link' size='small' onClick={() => remove(name)}>
                      <DeleteOutlined />
                    </Button>
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('新增变量')}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
