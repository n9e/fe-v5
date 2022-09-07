import React from 'react';
import { Input, Form } from 'antd';

const FormItem = Form.Item;

export default function Description() {
  return (
    <div>
      <div className='page-title' style={{ marginTop: '8px' }}>
        备注
      </div>
      <FormItem
        // label='备注'
        name='description'
        rules={[]}
      >
        <Input.TextArea placeholder='请输入相关说明' rows={4} showCount maxLength={500} />
      </FormItem>
    </div>
  );
}
