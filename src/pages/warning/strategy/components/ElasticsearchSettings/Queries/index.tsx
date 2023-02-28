import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, Tooltip, AutoComplete, InputNumber, Select } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { getIndices } from '@/services/warning';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import Value from './Value';
import GroupBy from '../GroupBy';
import { useTranslation } from "react-i18next";
interface IProps {
  form: any;
  cate: string;
  cluster: string[];
}
const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');
export default function index(props: IProps) {
  const {
    t
  } = useTranslation();
  const {
    form,
    cate,
    cluster
  } = props;
  const [indexOptions, setIndexOptions] = useState([]);
  const [indexSearch, setIndexSearch] = useState('');
  useEffect(() => {
    if (!_.isEmpty(cluster)) {
      getIndices({
        cate,
        cluster: _.join(cluster, ' ')
      }).then(res => {
        setIndexOptions(_.map(res.dat, item => {
          return {
            value: item
          };
        }));
      });
    }
  }, [cate, _.join(cluster)]);
  return <Form.List name={['queries']}>
      {(fields, {
      add,
      remove
    }) => <>
          <div style={{
        marginBottom: 8
      }}>
            {t("查询统计")}{t("计")}{' '}
            <PlusCircleOutlined onClick={() => {
          add({});
        }} />
          </div>
          {fields.map((field, index) => {
        return <div key={field.key} style={{
          backgroundColor: '#fafafa',
          padding: 16,
          marginBottom: 16,
          position: 'relative'
        }}>
                <Row gutter={8}>
                  <Col flex='32px'>
                    <Form.Item>
                      <Input readOnly style={{
                  width: '32px'
                }} value={alphabet[index]} />
                    </Form.Item>
                  </Col>
                  <Col flex='auto'>
                    <Row gutter={8}>
                      <Col span={8}>
                        <InputGroupWithFormItem label={<span>
                              {t("索引")}{t("引")}{' '}
                              <Tooltip title={<div>
                                    {t("支持多种配置方式")}
                                   <br />
                                    1. {t("指定单个索引")} gb {t("在")} gb {t("索引中搜索所有的文档")}
                                   <br />
                                    2. {t("指定多个索引")} gb,us {t("在")} gb {t("和")} us {t("索引中搜索所有的文档")}
                                   <br />
                                    3. {t("指定索引前缀")} g*,u* {t("在任何以")} g {t("或者")} u {t("开头的索引中搜索所有的文档")}
                                   <br />
                                  </div>}>
                                <QuestionCircleOutlined />
                              </Tooltip>
                            </span>}>
                          <Form.Item {...field} name={[field.name, 'index']} rules={[{
                      required: true,
                      message: t("请输入索引")
                    }]}>
                            <AutoComplete dropdownMatchSelectWidth={false} options={_.filter(indexOptions, item => {
                        if (indexSearch) {
                          return item.value.includes(indexSearch);
                        }

                        return true;
                      })} onSearch={val => {
                        setIndexSearch(val);
                      }} />
                          </Form.Item>
                        </InputGroupWithFormItem>
                      </Col>
                      <Col span={7}>
                        <InputGroupWithFormItem label={<span>
                              {t("查询条件")}{t("件")}{' '}
                              <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax ' target='_blank'>
                                <QuestionCircleOutlined />
                              </a>
                            </span>} labelWidth={90}>
                          <Form.Item {...field} name={[field.name, 'filter']}>
                            <Input />
                          </Form.Item>
                        </InputGroupWithFormItem>
                      </Col>
                      <Col span={5}>
                        <InputGroupWithFormItem label={t("时间字段")} labelWidth={80}>
                          <Form.Item {...field} name={[field.name, 'date_field']}>
                            <Input />
                          </Form.Item>
                        </InputGroupWithFormItem>
                      </Col>
                      <Col span={4}>
                        <Input.Group>
                          <span className='ant-input-group-addon'>{t("间隔")}</span>
                          <Form.Item {...field} name={[field.name, 'interval']} noStyle>
                            <InputNumber style={{
                        width: '100%'
                      }} />
                          </Form.Item>
                          <span className='ant-input-group-addon'>
                            <Form.Item {...field} name={[field.name, 'interval_unit']} noStyle initialValue='min'>
                              <Select>
                                <Select.Option value='second'>{t("秒")}</Select.Option>
                                <Select.Option value='min'>{t("分")}</Select.Option>
                                <Select.Option value='hour'>{t("小时")}</Select.Option>
                              </Select>
                            </Form.Item>
                          </span>
                        </Input.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Form.Item shouldUpdate noStyle>
                  {({
              getFieldValue
            }) => {
              const index = getFieldValue(['queries', field.name, 'index']);
              return <>
                        <Value cate={cate} cluster={cluster} index={index} prefixField={field} />
                        <div style={{
                  marginTop: 8
                }}>
                          <GroupBy cate={cate} cluster={cluster} index={index} prefixField={field} prefixFields={['queries']} prefixNameField={[field.name]} backgroundVisible={false} />
                        </div>
                      </>;
            }}
                </Form.Item>
                {fields.length > 1 && <CloseCircleOutlined style={{
            position: 'absolute',
            right: -4,
            top: -4
          }} onClick={() => {
            remove(field.name);
          }} />}
              </div>;
      })}
        </>}
    </Form.List>;
}