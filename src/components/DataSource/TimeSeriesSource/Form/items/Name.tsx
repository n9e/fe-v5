import React from 'react';
import { Input, Form } from 'antd';

const FormItem = Form.Item;

export default function Name() {
  return (
    <div>
      <div className='page-title'>数据源名称</div>
      <FormItem
        label='名称'
        name='name'
        rules={[{ required: true }, { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '请输入字母/数字/下划线，必须以字母开头' }, { min: 3, message: '最少输入三位' }]}
      >
        <Input placeholder='请输入名称' />
      </FormItem>
    </div>
  );
}
