---
order: 0
title: 基本
---

这是一个基础的动态表单。

```jsx
import React, { useState } from 'react';
import { Form, Button, Input, Icon } from 'antd';
import { useDynamicList } from 'antd-advanced';

const Demo = (props) => {
  const { list, remove, getKey, push } = useDynamicList(['David', 'Jack']);
  const { getFieldDecorator, validateFields } = props.form;

  const [result, setResult] = useState('');

  const Row = (index, item) => (
    <Form.Item key={getKey(index)}>
      {getFieldDecorator(`names[${getKey(index)}]`, {
        initialValue: item,
        rules: [
          {
            required: true,
            message: 'required',
          },
        ],
      })(<Input style={{ width: 300 }} placeholder='Please enter your name' />)}
      {list.length > 1 && (
        <Icon
          type='minus-circle-o'
          style={{ marginLeft: 8 }}
          onClick={() => {
            remove(index);
          }}
        />
      )}
      <Icon
        type='plus-circle-o'
        style={{ marginLeft: 8 }}
        onClick={() => {
          push('');
        }}
      />
    </Form.Item>
  );

  return (
    <>
      <Form>{list.map((ele, index) => Row(index, ele))}</Form>
      <Button
        style={{ marginTop: 8 }}
        type='primary'
        onClick={() =>
          validateFields((err, val) => {
            if (!err) {
              setResult(JSON.stringify((val || {}).names.filter((e) => !!e)));
            }
          })
        }
      >
        Submit
      </Button>
      <div>{result}</div>
    </>
  );
};
const BasicDemoForm = Form.create({ name: 'basic-form' })(Demo);

ReactDOM.render(<BasicDemoForm />, mountNode);
```
