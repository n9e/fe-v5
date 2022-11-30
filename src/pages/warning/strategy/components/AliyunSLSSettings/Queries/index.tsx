import React from 'react';
import { Form, Space, Tooltip, Switch, Input } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { RelativeTimeRangePicker } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import ProjectSelect from '@/pages/metric/explorer/AliyunSLS/ProjectSelect';
import LogstoreSelect from '@/pages/metric/explorer/AliyunSLS/LogstoreSelect';
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
            {fields.map((field) => {
              return (
                <div key={field.key}>
                  <Space>
                    <Form.Item {...field} name={[field.name, 'ref']}>
                      <Input disabled style={{ width: 32 }} />
                    </Form.Item>

                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const cate = getFieldValue('cate');
                        const cluster = getFieldValue('cluster');
                        const project = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name, 'project']);
                        return (
                          <Space style={{ display: 'flex' }}>
                            <ProjectSelect datasourceCate={cate} datasourceName={_.join(cluster, ' ')} prefixField={field} prefixName={[field.name]} />
                            <LogstoreSelect datasourceCate={cate} datasourceName={_.join(cluster, ' ')} prefixField={field} prefixName={[field.name]} project={project} />
                            <InputGroupWithFormItem
                              label={
                                <span>
                                  查询条件{' '}
                                  <Tooltip
                                    title={
                                      <a href='https://help.aliyun.com/document_detail/43772.html' target='_blank' style={{ color: '#c6b2fd' }}>
                                        详细文档
                                      </a>
                                    }
                                  >
                                    <QuestionCircleOutlined />
                                  </Tooltip>
                                </span>
                              }
                              labelWidth={90}
                            >
                              <Form.Item {...field} name={[field.name, 'query']} style={{ width: 250 }}>
                                <Input />
                              </Form.Item>
                            </InputGroupWithFormItem>
                            <InputGroupWithFormItem label='查询区间' labelWidth={80}>
                              <Form.Item {...field} name={[field.name, 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
                                <RelativeTimeRangePicker />
                              </Form.Item>
                            </InputGroupWithFormItem>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <div style={{ lineHeight: '32px' }}>SQL增强</div>
                              <Form.Item {...field} name={[field.name, 'power_sql']} valuePropName='checked'>
                                <Switch />
                              </Form.Item>
                            </div>
                          </Space>
                        );
                      }}
                    </Form.Item>
                    {fields.length > 1 && (
                      <Form.Item>
                        <div
                          style={{
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            remove(field.name);
                          }}
                        >
                          <MinusCircleOutlined />
                        </div>
                      </Form.Item>
                    )}
                  </Space>
                  <AdvancedSettings prefixField={field} />
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
