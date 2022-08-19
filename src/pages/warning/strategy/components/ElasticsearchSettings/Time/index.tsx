import React from 'react';
import { Row, Col, Form, Input, InputNumber, Select } from 'antd';

export default function index() {
  return (
    <>
      <div style={{ marginBottom: 8 }}>时间颗粒度</div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name={['query', 'date_field']}>
            <Input placeholder='日期字段 key' />
          </Form.Item>
        </Col>
        {/* <Col span={8}>
          <Form.Item name={['query', 'date_format']}>
            <Input placeholder='时间戳格式' />
          </Form.Item>
        </Col> */}
        <Col span={12}>
          <Input.Group>
            <span className='ant-input-group-addon'>间隔</span>
            <Form.Item name={['query', 'interval']} noStyle>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <span className='ant-input-group-addon'>
              <Form.Item name={['query', 'interval_unit']} noStyle initialValue='min'>
                <Select>
                  <Select.Option value='min'>分</Select.Option>
                  <Select.Option value='hour'>小时</Select.Option>
                </Select>
              </Form.Item>
            </span>
          </Input.Group>
        </Col>
      </Row>
    </>
  );
}
