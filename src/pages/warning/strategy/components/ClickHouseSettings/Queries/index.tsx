import React from 'react';
import { Form, Space, Input, Row, Col, Select, Tooltip } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { RelativeTimeRangePicker } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import Query from '@/pages/metric/explorer/AliyunSLS/Query';
import GraphPreview from './GraphPreview';
import AdvancedSettings from './AdvancedSettings';
import './style.less';

interface IProps {
  form: any;
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
}

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function index({ form, prefixField = {}, fullPrefixName = [], prefixName = [] }: IProps) {
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
            <div style={{ marginBottom: 8 }}>
              查询统计{' '}
              <PlusCircleOutlined
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  add({
                    ref: alphabet[fields.length],
                  });
                }}
              />
            </div>
            {fields.map((field, index) => {
              return (
                <div key={field.key} style={{ backgroundColor: '#fafafa', padding: 16, marginBottom: 16, position: 'relative' }}>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      return (
                        <>
                          <Row gutter={8}>
                            <Col flex='32px'>
                              <Form.Item>
                                <Input readOnly style={{ width: 32 }} value={alphabet[index]} />
                              </Form.Item>
                            </Col>
                            <Col flex='auto'>
                              <InputGroupWithFormItem label='SQL' labelWidth={64}>
                                <Form.Item {...field} name={[field.name, 'sql']} rules={[{ required: true, message: '请输入 SQL' }]}>
                                  <Input />
                                </Form.Item>
                              </InputGroupWithFormItem>
                            </Col>
                            <Col flex='650px'>
                              <Space style={{ display: 'flex' }}>
                                <InputGroupWithFormItem
                                  label={
                                    <Space>
                                      <span>时间字段</span>
                                      <Tooltip
                                        title={
                                          'SQL中代表时间的字段，该字段会作为数据的查询范围和时序数据的时间。如果为空则需要自行在SQL中处理查询范围，避免查全表数据量过大导致系统异常'
                                        }
                                      >
                                        <QuestionCircleOutlined />
                                      </Tooltip>
                                    </Space>
                                  }
                                  labelWidth={95}
                                >
                                  <Form.Item {...field} name={[field.name, 'time_field']} rules={[{ required: true, message: '请输入时间字段' }]}>
                                    <Input />
                                  </Form.Item>
                                </InputGroupWithFormItem>
                                <InputGroupWithFormItem label='时间格式' labelWidth={84}>
                                  <Form.Item {...field} name={[field.name, 'time_format']} initialValue='datetime'>
                                    <Select style={{ width: 120 }} allowClear>
                                      {_.map(
                                        [
                                          {
                                            label: 'DateTime',
                                            value: 'datetime',
                                          },
                                          {
                                            label: '秒时间戳',
                                            value: 'epoch_second',
                                          },
                                          {
                                            label: '毫秒时间戳',
                                            value: 'epoch_millis',
                                          },
                                        ],
                                        (item) => {
                                          return (
                                            <Select.Option key={item.value} value={item.value}>
                                              {item.label}
                                            </Select.Option>
                                          );
                                        },
                                      )}
                                    </Select>
                                  </Form.Item>
                                </InputGroupWithFormItem>
                                <InputGroupWithFormItem label='查询区间' labelWidth={80}>
                                  <Form.Item {...field} name={[field.name, 'range']} initialValue={{ start: 'now-5m', end: 'now' }}>
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
                  <AdvancedSettings prefixField={field} />
                  {fields.length > 1 && (
                    <CloseCircleOutlined
                      style={{ position: 'absolute', right: 16, top: 16 }}
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
      <GraphPreview form={form} />
    </>
  );
}
