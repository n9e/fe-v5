import React from 'react';
import { Input, Form, Switch } from 'antd';
import FormItem from './FormItem';

// const FormItem = Form.Item;

export default function WriteConfig() {
  return (
    <div>
      <div className='page-title'>写配置</div>
      <>
        <span className='mr16'>允许写入</span>
        <FormItem
          layout='inline'
          // label='允许写入'
          name={['settings', `es.enable_write`]}
          valuePropName='checked'
          rules={[]}
        >
          <Switch />
        </FormItem>
      </>
    </div>
  );
}
