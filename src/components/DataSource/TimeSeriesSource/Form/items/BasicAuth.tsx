import React, { useState } from 'react';
import { Input, Form, Row, Col, Switch } from 'antd';
import { IFromItemBaseProps } from '../../types';
import FormItem from './FormItem';
import { MinusCircleOutlined } from '@ant-design/icons';

// const FormItem = Form.Item;

export default function BasicAuth({ namePrefix, type }: IFromItemBaseProps) {
  const requiredShow = ['zabbix'];

  return (
    <Form.Item
      noStyle
      shouldUpdate={(prevValues, currentValues) => {
        return prevValues.basic?.enabled !== currentValues.basic?.enabled;
      }}
    >
      {({ getFieldValue }) => {
        // if (getFieldValue([...namePrefix, 'basic', 'enabled'])) {
        return (
          <div>
            <div className='page-title'>授权</div>
            <Row gutter={16}>
              <Col flex={'1'}>
                <Form.Item label='用户名' name={[...namePrefix, `${type}.user`]} rules={[{ required: requiredShow.includes(type) }]}>
                  <Input placeholder='请输入用户名' autoComplete='off' />
                </Form.Item>
              </Col>
              <Col flex={'1'}>
                <Form.Item label='密码' name={[...namePrefix, `${type}.password`]} rules={[{ required: requiredShow.includes(type) }]}>
                  <Input.Password placeholder='请输入密码' autoComplete='new-password' />
                </Form.Item>
              </Col>
              <Col>
                <div style={{ width: '30px' }}></div>
              </Col>
            </Row>
            {type === 'es' && (
              <>
                <span className='mr16'>跳过TLS检查</span>
                <FormItem
                  layout='inline'
                  // label='跳过TLS检查'
                  name={['settings', `es.tls`, 'es.tls.skip_tls_verify']}
                  valuePropName='checked'
                  rules={[{ required: requiredShow.includes(type) }]}
                >
                  <Switch />
                </FormItem>
              </>
            )}
          </div>
        );
        // }
        // return null;
      }}
    </Form.Item>
  );
}
