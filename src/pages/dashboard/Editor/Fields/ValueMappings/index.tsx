import React from 'react';
import { Form, Input, InputNumber, Button, Select, Row, Col, Space } from 'antd';
import { CloseSquareOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { Panel } from '../../Components/Collapse';

export default function index() {
  const namePrefix = ['options', 'valueMappings'];

  return (
    <Panel header='阈值'>
      <Form.List name={namePrefix}>
        {(fields, { add, remove }) => (
          <>
            <Button
              style={{ width: '100%', marginBottom: 10 }}
              onClick={() => {
                add({
                  type: 'special',
                });
              }}
            >
              添加
            </Button>
            <Row gutter={10}>
              <Col flex='290px'>条件</Col>
              <Col flex='100'>显示文字</Col>
              <Col flex='50'>颜色</Col>
              <Col flex='50'>操作</Col>
            </Row>
            {fields.map(({ key, name, ...restField }) => {
              return (
                <Row gutter={10} style={{ marginBottom: 10 }}>
                  <Col flex='290px'>
                    <Space>
                      <Form.Item noStyle {...restField} name={[name, 'type']}>
                        <Select style={{ width: 80 }}>
                          <Select.Option value='special'>固定值</Select.Option>
                          <Select.Option value='range'>范围值</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item noStyle {...restField} shouldUpdate={(prevValues, curValues) => _.get(prevValues, [name, 'type']) !== _.get(curValues, [name, 'type'])}>
                        {({ getFieldValue }) => {
                          const type = getFieldValue([...namePrefix, name, 'type']);
                          if (type === 'special') {
                            return (
                              <Form.Item noStyle {...restField} name={[name, 'match', 'special']}>
                                <InputNumber style={{ width: '100%' }} />
                              </Form.Item>
                            );
                          }
                          if (type === 'range') {
                            return (
                              <Space>
                                <Form.Item noStyle {...restField} name={[name, 'match', 'from']}>
                                  <InputNumber />
                                </Form.Item>
                                <Form.Item noStyle {...restField} name={[name, 'match', 'to']}>
                                  <InputNumber />
                                </Form.Item>
                              </Space>
                            );
                          }
                          return null;
                        }}
                      </Form.Item>
                    </Space>
                  </Col>
                  <Col flex='100'>
                    <Form.Item noStyle {...restField} name={[name, 'result', 'text']}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col flex='50'>
                    <Form.Item noStyle {...restField} name={[name, 'result', 'color']}>
                      <Input type='color' />
                    </Form.Item>
                  </Col>
                  <Col flex='50'>
                    <CloseSquareOutlined
                      onClick={() => {
                        remove(name);
                      }}
                    />
                  </Col>
                </Row>
              );
            })}
          </>
        )}
      </Form.List>
    </Panel>
  );
}
