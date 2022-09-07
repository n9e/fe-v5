import React from 'react';
import { Input, Form } from 'antd';
import { IFromItemBaseProps } from '../../types';

const FormItem = Form.Item;

export default function ServiceEntry({ namePrefix, type }: IFromItemBaseProps) {
  return (
    <div>
      <div className='page-title'>服务入口</div>
      <FormItem label='访问域名（私网域名/公网域名/跨域域名）' name={[...namePrefix, `${type}.endpoint`]} rules={[{ required: true, message: '请输入访问域名' }]}>
        <Input placeholder='请输入访问域名' />
      </FormItem>
    </div>
  );
}
