import React from 'react';
import { Form, Space, Tooltip, Switch, Input, Row, Col } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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
            {fields.map((field, index) => {
              return (
                <div key={field.key} style={{ backgroundColor: '#fafafa', padding: 16, marginBottom: 16, position: 'relative' }}>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const cate = getFieldValue('cate');
                      const cluster = getFieldValue('cluster');
                      const project = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name, 'project']);
                      return (
                        <>
                          <Row gutter={8}>
                            <Col flex='32px'>
                              <Form.Item>
                                <Input readOnly style={{ width: 32 }} value={alphabet[index]} />
                              </Form.Item>
                            </Col>
                            <Col flex='auto'>
                              <Row gutter={8}>
                                <Col span={12}>
                                  <ProjectSelect width='100%' datasourceCate={cate} datasourceName={_.join(cluster, ' ')} prefixField={field} prefixName={[field.name]} />
                                </Col>
                                <Col span={12}>
                                  <LogstoreSelect
                                    width='100%'
                                    datasourceCate={cate}
                                    datasourceName={_.join(cluster, ' ')}
                                    prefixField={field}
                                    prefixName={[field.name]}
                                    project={project}
                                  />
                                </Col>
                              </Row>
                            </Col>
                            <Col flex='360px'>
                              <Space style={{ display: 'flex' }}>
                                <InputGroupWithFormItem label='查询区间' labelWidth={80}>
                                  <Form.Item {...field} name={[field.name, 'range']} initialValue={{ start: 'now-5m', end: 'now' }}>
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
                            </Col>
                            <Col span={24}>
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
                                <Form.Item {...field} name={[field.name, 'query']} style={{ width: '100%' }}>
                                  <Input />
                                </Form.Item>
                              </InputGroupWithFormItem>
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
