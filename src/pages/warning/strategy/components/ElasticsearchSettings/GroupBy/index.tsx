import React from 'react';
import { Form, Row, Col } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import Filters from './Filters';
import Terms from './Terms';
import Histgram from './Histgram';

export default function index() {
  return (
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
          {fields.map(({ key, name, ...restField }) => {
            return (
              <div key={key} style={{ marginBottom: 16 }}>
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const cate = getFieldValue(['query', 'group_by', name, 'cate']);
                    return (
                      <Row gutter={16}>
                        <Col flex='auto'>
                          <div
                            style={{
                              backgroundColor: '#FAFAFA',
                              padding: 16,
                            }}
                          >
                            {cate === 'filters' && <Filters restField={restField} name={name} />}
                            {cate === 'terms' && <Terms restField={restField} name={name} />}
                            {cate === 'histgram' && <Histgram restField={restField} name={name} />}
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
