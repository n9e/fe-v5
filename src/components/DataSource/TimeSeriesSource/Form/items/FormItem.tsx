import React from 'react';
import { Form } from 'antd';
import classnames from 'classnames';

interface IProps {
  layout?: 'horizontal' | 'inline';
  labelSize?: 'default' | 'small'; // default: 184px, small: 52px
  forceBorder?: boolean; // 用于 Switch 被边框包裹的情况
  label?: string;
  name?: string | number | (string | number)[];
  valuePropName?: string;
  tooltip?: any;
  rules?: any[];
  children: any;
}

export default function FormItem(props: IProps) {
  const { layout = 'horizontal', labelSize = 'default', forceBorder = false, label, name, valuePropName, tooltip, rules, children } = props;
  return (
    <div
      className={classnames({
        'settings-source-form-item': true,
        'settings-source-form-item-small': labelSize === 'small',
        'settings-source-form-item-force-border': forceBorder,
      })}
      style={{ display: layout === 'horizontal' ? 'block' : 'inline-block' }}
    >
      <Form.Item label={label} name={name} rules={rules} tooltip={tooltip} valuePropName={valuePropName}>
        {children}
      </Form.Item>
    </div>
  );
}
