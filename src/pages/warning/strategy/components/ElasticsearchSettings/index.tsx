import React from 'react';
import { Form, Row, Col, Input, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import GroupByFiltersParams from './GroupByFiltersParams';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');
const functions = ['count', 'avg', 'sum', 'max', 'min', 'p90', 'p95', 'p99'];
const groupByCates = ['filters', 'terms', 'histgram'];

export default function index() {
  return (
    <Form.Item shouldUpdate noStyle>
      {({ getFieldValue }) => {
        if (getFieldValue('cate') === 'es') {
          return (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label='索引' name='index'>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label='过滤项' name={['query', 'filter']}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.List name={['query', 'value']}>
                {(fields, { add, remove }) => (
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      数值提取{' '}
                      <PlusCircleOutlined
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          add({
                            ref: alphabet[fields.length],
                            func: functions[0],
                            field: '',
                          });
                        }}
                      />
                    </div>
                    {fields.map(({ key, name }, index) => {
                      return (
                        <div key={key} style={{ marginBottom: 16 }}>
                          <Form.Item name={[name, 'ref']} hidden>
                            <div />
                          </Form.Item>
                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => {
                              const func = getFieldValue(['query', 'value', name, 'func']);
                              return (
                                <Row gutter={16}>
                                  <Col flex='auto'>
                                    <Row gutter={16}>
                                      <Col span={func === 'count' ? 24 : 12}>
                                        <Input.Group>
                                          <span className='ant-input-group-addon'>{alphabet[index]}</span>
                                          <Form.Item name={[name, 'func']} noStyle>
                                            <Select style={{ width: '100%' }}>
                                              {functions.map((func) => (
                                                <Select.Option key={func} value={func}>
                                                  {func}
                                                </Select.Option>
                                              ))}
                                            </Select>
                                          </Form.Item>
                                        </Input.Group>
                                      </Col>
                                      {func !== 'count' && (
                                        <Col span={12}>
                                          <Form.Item name={[name, 'field']} noStyle>
                                            <Input />
                                          </Form.Item>
                                        </Col>
                                      )}
                                    </Row>
                                  </Col>
                                  <Col flex='40px'>
                                    <div
                                      style={{
                                        height: 30,
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => {
                                        remove(name);
                                      }}
                                    >
                                      <MinusCircleOutlined />
                                    </div>
                                  </Col>
                                </Row>
                              );
                            }}
                          </Form.Item>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Form.List>
              <Form.List name={['query', 'group_by']}>
                {(fields, { add, remove }) => (
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      Group By{' '}
                      <PlusCircleOutlined
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          add({
                            cate: 'filters',
                            params: [
                              {
                                alias: '',
                                query: '',
                              },
                            ],
                          });
                        }}
                      />
                    </div>
                    {fields.map(({ key, name, ...restField }, index) => {
                      return (
                        <div key={key} style={{ marginBottom: 16 }}>
                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => {
                              const cate = getFieldValue(['query', 'group_by', name, 'cate']);
                              if (cate === 'filters') {
                                return (
                                  <Row gutter={16}>
                                    <Col flex='auto'>
                                      <div
                                        style={{
                                          backgroundColor: '#FAFAFA',
                                          padding: 16,
                                        }}
                                      >
                                        <Form.Item {...restField} name={[name, 'cate']}>
                                          <Select style={{ width: '100%' }}>
                                            {groupByCates.map((func) => (
                                              <Select.Option key={func} value={func}>
                                                {func}
                                              </Select.Option>
                                            ))}
                                          </Select>
                                        </Form.Item>
                                        <GroupByFiltersParams restField={restField} name={name} />
                                      </div>
                                    </Col>
                                    <Col flex='40px' style={{ display: 'flex', alignItems: 'center' }}>
                                      <div
                                        onClick={() => {
                                          remove(name);
                                        }}
                                      >
                                        <MinusCircleOutlined style={{ cursor: 'pointer' }} />
                                      </div>
                                    </Col>
                                  </Row>
                                );
                              }
                            }}
                          </Form.Item>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Form.List>
            </>
          );
        }
      }}
    </Form.Item>
  );
}
