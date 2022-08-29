import React from 'react';
import { Form, Select, Row, Col, Input, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { groupByCates } from './configs';

export default function Filters({ restField, name }) {
  return (
    <>
      <Form.Item {...restField} name={[name, 'cate']}>
        <Select style={{ width: '100%' }}>
          {groupByCates.map((func) => (
            <Select.Option key={func} value={func}>
              {func}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.List {...restField} name={[name, 'params']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map(({ key, name }, index) => {
                return (
                  <Row gutter={16} key={key} style={{ marginBottom: index < fields.length - 1 ? 16 : 0 }}>
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
    </>
  );
}
