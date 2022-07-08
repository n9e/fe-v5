import React, { useRef } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import { PasswordProps } from 'antd/es/input/Password';

export default function index(props: PasswordProps) {
  const isFirstInput = useRef(true);
  return (
    <Input.Password
      {...props}
      onChange={(e) => {
        if (isFirstInput.current) {
          isFirstInput.current = false;
          // TODO: inputType 类型有点多，最佳体验应该是 insertText 或是 insertFromPaste 这类需要把值设置成新增的字符
          e.target.value = '';
        }
        if (props.onChange) {
          props.onChange(e);
        }
      }}
      onBlur={() => {
        isFirstInput.current = true;
      }}
    />
  );
}
