import React from 'react';
import { Form, Row, Col, Input, Button } from 'antd';
import Value from './Value';
import GroupBy from './GroupBy';
import Time from './Time';
import Rules from './Rules';

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
              <Value />
              <GroupBy />
              <Time />
              <Button type='primary' style={{ marginBottom: 16 }}>
                数据预览
              </Button>
              <Rules />
            </>
          );
        }
      }}
    </Form.Item>
  );
}
