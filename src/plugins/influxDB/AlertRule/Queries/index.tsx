import React, { useState, useEffect } from 'react';
import { Form, Space, Input, Row, Col, Select, Tooltip } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { DatasourceCateEnum } from '@/utils/constant';
import { RelativeTimeRangePicker } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import AdvancedSettings from '../../components/AdvancedSettings';
import { getInfluxdbDBs } from '../../services';

interface IProps {
  form: any;
  datasourceValue: string;
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
}
const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');
export default function index({ form, datasourceValue, prefixField = {}, fullPrefixName = [], prefixName = [] }: IProps) {
  const { t } = useTranslation();
  const [dbnames, setDbnames] = useState<string[]>([]);

  useEffect(() => {
    if (datasourceValue) {
      getInfluxdbDBs({
        cate: DatasourceCateEnum.influxDB,
        cluster: datasourceValue,
      }).then((res) => {
        setDbnames(res);
      });
    }
  }, [datasourceValue]);

  return (
    <>
      <Form.List
        {...prefixField}
        name={[...prefixName, 'queries']}
        initialValue={[
          {
            ref: 'A',
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <div>
            <div
              style={{
                marginBottom: 8,
              }}
            >
              {t('查询统计')}计{' '}
              <PlusCircleOutlined
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => {
                  add({
                    ref: alphabet[fields.length],
                  });
                }}
              />
            </div>
            {fields.map((field, index) => {
              return (
                <div
                  key={field.key}
                  style={{
                    backgroundColor: '#fafafa',
                    padding: 16,
                    marginBottom: 16,
                    position: 'relative',
                  }}
                >
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      return (
                        <>
                          <Row gutter={8}>
                            <Col flex='32px'>
                              <Form.Item>
                                <Input
                                  readOnly
                                  style={{
                                    width: 32,
                                  }}
                                  value={alphabet[index]}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex='240px'>
                              <InputGroupWithFormItem
                                label={
                                  <Space>
                                    <span>数据库</span>
                                    <Tooltip title={''}>
                                      <QuestionCircleOutlined />
                                    </Tooltip>
                                  </Space>
                                }
                                labelWidth={84}
                              >
                                <Form.Item
                                  {...field}
                                  name={[field.name, 'dbname']}
                                  rules={[
                                    {
                                      required: true,
                                      message: t('请选择数据库'),
                                    },
                                  ]}
                                >
                                  <Select>
                                    {_.map(dbnames, (dbname) => {
                                      return (
                                        <Select.Option key={dbname} value={dbname}>
                                          {dbname}
                                        </Select.Option>
                                      );
                                    })}
                                  </Select>
                                </Form.Item>
                              </InputGroupWithFormItem>
                            </Col>
                            <Col flex='auto'>
                              <Space
                                style={{
                                  display: 'flex',
                                }}
                              >
                                <InputGroupWithFormItem
                                  label={
                                    <Space>
                                      <span>{t('查询条件')}</span>
                                      <Tooltip title={''}>
                                        <QuestionCircleOutlined />
                                      </Tooltip>
                                    </Space>
                                  }
                                  labelWidth={95}
                                >
                                  <Form.Item {...field} name={[field.name, 'command']}>
                                    <Input style={{ width: 500 }} />
                                  </Form.Item>
                                </InputGroupWithFormItem>
                                <InputGroupWithFormItem label={t('查询区间')} labelWidth={80}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'range']}
                                    initialValue={{
                                      start: 'now-5m',
                                      end: 'now',
                                    }}
                                  >
                                    <RelativeTimeRangePicker allowClear />
                                  </Form.Item>
                                </InputGroupWithFormItem>
                              </Space>
                            </Col>
                          </Row>
                        </>
                      );
                    }}
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const dbname = getFieldValue([...fullPrefixName, 'queries', index, 'dbname']);
                      return <AdvancedSettings datasourceCate={DatasourceCateEnum.influxDB} datasourceName={datasourceValue} dbname={dbname} />;
                    }}
                  </Form.Item>
                  {fields.length > 1 && (
                    <CloseCircleOutlined
                      style={{
                        position: 'absolute',
                        right: -4,
                        top: -4,
                      }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Form.List>
    </>
  );
}
