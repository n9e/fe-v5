import React from 'react';
import { Form, Row, Col, Input, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Rule from './Rule';
import { ops, functions } from './configs';

export default function index() {
  return (
    <Form.Item shouldUpdate>
      {({ getFieldValue }) => {
        const queryValues = getFieldValue(['query', 'values']);
        return (
          <Form.List name={['query', 'rules']}>
            {(fields, { add, remove }) => (
              <div>
                <div style={{ marginBottom: 8 }}>
                  提取值{' '}
                  <PlusCircleOutlined
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      add({
                        rule: [
                          {
                            value: 'A',
                            func: functions[0],
                            op: ops[0],
                          },
                        ],
                        rule_op: 'AND',
                        severity: 1,
                      });
                    }}
                  />
                </div>
                {fields.map(({ key, name, ...restField }) => {
                  return (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col flex='auto'>
                          <div
                            style={{
                              backgroundColor: '#FAFAFA',
                              padding: 16,
                            }}
                          >
                            <Rule restField={restField} name={name} queryValues={queryValues} />
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
                    </div>
                  );
                })}
              </div>
            )}
          </Form.List>
        );
      }}
    </Form.Item>
  );
}
