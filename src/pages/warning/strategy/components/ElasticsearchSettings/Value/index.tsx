import React from 'react';
import { Form, Row, Col, Input, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');
const functions = ['count', 'avg', 'sum', 'max', 'min', 'p90', 'p95', 'p99'];

export default function index() {
  return (
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
  );
}
