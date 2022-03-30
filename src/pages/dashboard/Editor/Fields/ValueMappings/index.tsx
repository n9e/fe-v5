import React from 'react';
import { Form, Input, InputNumber, Button, Select, Row, Col, Tooltip } from 'antd';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { Panel } from '../../Components/Collapse';

interface IProps {
  preNamePrefix?: (string | number)[];
  namePrefix?: (string | number)[];
}

export default function index(props: IProps) {
  const { preNamePrefix = [], namePrefix = ['options', 'valueMappings'] } = props;

  return (
    <Panel header='值映射'>
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
            {_.isEmpty(fields) ? null : (
              <Row gutter={10}>
                <Col flex='290px'>
                  <Tooltip
                    overlayInnerStyle={{
                      width: 300,
                    }}
                    title={
                      <div>
                        <div>范围值说明: from &gt;= value &lt;= to</div>
                        <div>范围值默认值: from=-Infinity; to=Infinity </div>
                      </div>
                    }
                  >
                    条件 <InfoCircleOutlined />
                  </Tooltip>
                </Col>
                <Col flex='100'>显示文字</Col>
                <Col flex='50'>颜色</Col>
                <Col flex='50'>操作</Col>
              </Row>
            )}

            {fields.map(({ key, name, ...restField }) => {
              return (
                <Row key={key} gutter={10} style={{ marginBottom: 10 }}>
                  <Col flex='290px'>
                    <Row gutter={10}>
                      <Col flex='80px'>
                        <Form.Item noStyle {...restField} name={[name, 'type']}>
                          <Select style={{ width: 80 }}>
                            <Select.Option value='special'>固定值</Select.Option>
                            <Select.Option value='range'>范围值</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col flex='1'>
                        <Form.Item noStyle {...restField} shouldUpdate={(prevValues, curValues) => _.get(prevValues, [name, 'type']) !== _.get(curValues, [name, 'type'])}>
                          {({ getFieldValue }) => {
                            const type = getFieldValue([...preNamePrefix, ...namePrefix, name, 'type']);
                            if (type === 'special') {
                              return (
                                <Form.Item noStyle {...restField} name={[name, 'match', 'special']}>
                                  <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                              );
                            }
                            if (type === 'range') {
                              return (
                                <Row gutter={10}>
                                  <Col span={12}>
                                    <Form.Item noStyle {...restField} name={[name, 'match', 'from']}>
                                      <InputNumber placeholder='from' />
                                    </Form.Item>
                                  </Col>
                                  <Col span={12}>
                                    <Form.Item noStyle {...restField} name={[name, 'match', 'to']}>
                                      <InputNumber placeholder='to' />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              );
                            }
                            return null;
                          }}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col flex='100'>
                    <Form.Item noStyle {...restField} name={[name, 'result', 'text']}>
                      <Input placeholder='可选' />
                    </Form.Item>
                  </Col>
                  <Col flex='50'>
                    <Form.Item noStyle {...restField} name={[name, 'result', 'color']}>
                      <Input type='color' />
                    </Form.Item>
                  </Col>
                  <Col flex='50'>
                    <Button
                      onClick={() => {
                        remove(name);
                      }}
                      icon={<DeleteOutlined />}
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
