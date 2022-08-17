import React from 'react';
import { Form, Row, Col, Input, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

interface IProps {
  restField: any;
  name: number;
}

export default function GroupByFiltersParams(props: IProps) {
  const { restField, name } = props;

  return (
    <Form.List {...restField} name={[name, 'params']}>
      {(fields, { add, remove }) => {
        console.log('fields', fields);
        return (
          <div>
            {fields.map(({ key, name }) => {
              return (
                <Row gutter={16} key={key} style={{ marginBottom: 16 }}>
                  <Col flex='auto'>
                    <Row gutter={16}>
                      <Col flex={12}>
                        <Form.Item name={[name, 'query']} noStyle>
                          <Input addonBefore='Query' />
                        </Form.Item>
                      </Col>
                      <Col flex={12}>
                        <Form.Item name={[name, 'alias']} noStyle>
                          <Input addonBefore='Alias' />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col flex='40px' style={{ display: 'flex', alignItems: 'center' }}>
                    <Space>
                      <PlusCircleOutlined
                        style={{
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          add({
                            alias: '',
                            query: '',
                          });
                        }}
                      />
                      {fields.length > 1 && (
                        <MinusCircleOutlined
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            remove(name);
                          }}
                        />
                      )}
                    </Space>
                  </Col>
                </Row>
              );
            })}
          </div>
        );
      }}
    </Form.List>
  );
}
