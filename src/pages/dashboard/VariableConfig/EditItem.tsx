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
import AdvancedWrap from '@/components/AdvancedWrap';
import IndexSelect from '@/pages/warning/strategy/components/ElasticsearchSettings/IndexSelect';
import ClusterSelect from '@/pages/dashboard/Editor/QueryEditor/components/ClusterSelect';
import { IVariable } from './definition';
import { convertExpressionToQuery, replaceExpressionVars, filterOptionsByReg, setVaraiableSelected } from './constant';
import { useTranslation } from "react-i18next";
interface IProps {
  cluster: string;
  id: string;
  range: IRawTimeRange;
  index: number;
  data: IVariable;
  onOk: (val: IVariable) => void;
  onCancel: () => void;
}
const typeOptions = [{
  label: 'Query',
  value: 'query'
}, {
  label: 'Custom',
  value: 'custom'
}, {
  label: 'Text box',
  value: 'textbox'
}, {
  label: 'Constant',
  value: 'constant'
}];
const prometheusOption = {
  value: 'prometheus',
  label: 'Prometheus'
};
const allOptions = [prometheusOption, {
  value: 'elasticsearch',
  label: 'Elasticsearch'
}];

function EditItem(props: IProps) {
  const {
    t
  } = useTranslation();
  const {
    cluster,
    data,
    range,
    id,
    index,
    onOk,
    onCancel
  } = props;
  const [form] = Form.useForm(); // TODO: 不太清楚这里的逻辑是干嘛的，后面找时间看下

  const handleBlur = (val?: string) => {
    const reg = data.reg;
    const expression = val || data.definition;

    if ((!reg || new RegExp('^/(.*?)/(g?i?m?y?)$').test(reg)) && expression && data) {
      const formData = form.getFieldsValue();
      var newExpression = replaceExpressionVars(expression, formData, index, id);
      convertExpressionToQuery(newExpression, range, data, cluster).then(res => {
        const regFilterRes = filterOptionsByReg(res, reg, formData, index, id);

        if (regFilterRes.length > 0) {
          setVaraiableSelected({
            name: formData.var[index].name,
            value: regFilterRes[0],
            id
          });
        }
      });
    }
  };

  return <Form layout='vertical' autoComplete='off' preserve={false} form={form} initialValues={data}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={t("变量名")} name='name' rules={[{
          required: true,
          message: t("请输入变量名")
        }, {
          pattern: /^[0-9a-zA-Z_]+$/,
          message: t("仅支持数字和字符下划线")
        }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={t("变量类型")} name='type' rules={[{
          required: true,
          message: t("请输入变量类型")
        }]}>
            <Select style={{
            width: '100%'
          }} onChange={() => {
            form.setFieldsValue({
              definition: '',
              defaultValue: ''
            });
          }}>
              {_.map(typeOptions, item => {
              const {
                t
              } = useTranslation();
              return <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>;
            })}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <AdvancedWrap var='VITE_IS_QUERY_ES_DS' children={isES => {
      const {
        t
      } = useTranslation();
      return <Form.Item shouldUpdate={(prevValues, curValues) => prevValues?.datasource?.cate !== curValues?.datasource?.cate} noStyle>
              {({
          getFieldValue
        }) => {
          const datasourceCate = getFieldValue(['datasource', 'cate']);
          return <Row gutter={16}>
                    <Col span={datasourceCate === 'elasticsearch' ? 8 : 24}>
                      <Form.Item label={t("数据源")} name={['datasource', 'cate']} rules={[{
                required: true,
                message: t("请选择数据源")
              }]} initialValue='prometheus'>
                        <Select dropdownMatchSelectWidth={false} style={{
                  minWidth: 70
                }}>
                          {_.map(isES ? allOptions : [prometheusOption], item => <Select.Option key={item.value} value={item.value}>
                              {item.label}
                            </Select.Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    {datasourceCate === 'elasticsearch' && <>
                        <Col span={8}>
                          <ClusterSelect cate={datasourceCate} label={t("关联数据源")} name={['datasource', 'name']} />
                        </Col>
                        <Col span={8}>
                          <Form.Item shouldUpdate={(prevValues, curValues) => prevValues?.datasource?.name !== curValues?.datasource?.name} noStyle>
                            {({
                    getFieldValue
                  }) => {
                    const datasourceName = getFieldValue(['datasource', 'name']);
                    return <IndexSelect name={['config', 'index']} cate={datasourceCate} cluster={datasourceName ? [datasourceName] : []} />;
                  }}
                          </Form.Item>
                        </Col>
                      </>}
                  </Row>;
        }}
            </Form.Item>;
    }} />
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type} noStyle>
        {({
        getFieldValue
      }) => {
        const type = getFieldValue('type');

        if (type === 'query') {
          return <>
                <Form.Item label={<span>
                      {t("变量定义")}义{' '}
                      <QuestionCircleOutlined style={{
                marginLeft: 5
              }} onClick={() => window.open('https://grafana.com/docs/grafana/latest/datasources/prometheus/#query-variable', '_blank')} />
                    </span>} name='definition' rules={[() => ({
              validator(_) {
                const datasourceCate = getFieldValue(['datasource', 'cate']);
                const definition = getFieldValue('definition');

                if (definition) {
                  if (datasourceCate === 'elasticsearch') {
                    try {
                      JSON.parse(definition);
                      return Promise.resolve();
                    } catch (e) {
                      return Promise.reject(t("变量定义必须是合法的JSON"));
                    }
                  }

                  return Promise.resolve();
                } else {
                  return Promise.reject(new Error('请输入变量定义'));
                }
              }

            })]}>
                  <Input onBlur={e => handleBlur(e.target.value)} />
                </Form.Item>
                <Form.Item label={t("正则")} name='reg' tooltip={t("可选，可通过正则来过滤可选项，或提取值")} rules={[{
              pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'),
              message: t("格式不对")
            }]}>
                  <Input placeholder='/*.hna/' onBlur={() => handleBlur()} />
                </Form.Item>
              </>;
        } else if (type === 'textbox') {
          return <Form.Item label={t("默认值")} name='defaultValue'>
                <Input onBlur={() => handleBlur()} />
              </Form.Item>;
        } else if (type === 'custom') {
          return <Form.Item label={t("逗号分割的自定义值")} name='definition' rules={[{
            required: true,
            message: t("请输入自定义值")
          }]}>
                <Input onBlur={() => handleBlur()} placeholder='1,10' />
              </Form.Item>;
        } else if (type === 'constant') {
          return <Form.Item label={t("常量值")} name='definition' tooltip={t("定义一个隐藏的常量值")} rules={[{
            required: true,
            message: t("请输入常量值")
          }]}>
                <Input onBlur={() => handleBlur()} />
              </Form.Item>;
        }
      }}
      </Form.Item>
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type} noStyle>
        {({
        getFieldValue
      }) => {
        const type = getFieldValue('type');

        if (type === 'query' || type === 'custom') {
          return <Row gutter={16}>
                <Col flex='70px'>
                  <Form.Item label={t("多选")} name='multi' valuePropName='checked'>
                    <Switch />
                  </Form.Item>
                </Col>
                <Col flex='70px'>
                  <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.multi !== curValues.multi} noStyle>
                    {({
                  getFieldValue
                }) => {
                  const multi = getFieldValue('multi');

                  if (multi) {
                    return <Form.Item label={t("包含全选")} name='allOption' valuePropName='checked'>
                            <Switch />
                          </Form.Item>;
                  }
                }}
                  </Form.Item>
                </Col>
                <Col flex='auto'>
                  <Form.Item shouldUpdate noStyle>
                    {({
                  getFieldValue
                }) => {
                  const multi = getFieldValue('multi');
                  const allOption = getFieldValue('allOption');

                  if (multi && allOption) {
                    return <Form.Item label={t("自定义全选值")} name='allValue'>
                            <Input placeholder='.*' />
                          </Form.Item>;
                  }
                }}
                  </Form.Item>
                </Col>
              </Row>;
        }
      }}
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type='primary' onClick={() => {
          form.validateFields().then(res => {
            onOk(res);
          });
        }}>
            {t("保存")}
         </Button>
          <Button onClick={onCancel}>{t("取消")}</Button>
        </Space>
      </Form.Item>
    </Form>;
}

export default EditItem;