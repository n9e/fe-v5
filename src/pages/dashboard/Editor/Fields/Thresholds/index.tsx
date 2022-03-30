import React from 'react';
import { Form, Input, InputNumber, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { Panel } from '../../Components/Collapse';

export default function index() {
  const namePrefix = ['options', 'thresholds'];

  return (
    <Panel header='阈值'>
      <Form.List name={[...namePrefix, 'steps']}>
        {(fields, { add, remove }) => (
          <>
            <Button
              style={{ width: '100%', marginBottom: 10 }}
              onClick={() => {
                add({
                  value: 0,
                });
              }}
            >
              添加
            </Button>
            {fields.map(({ key, name, ...restField }) => {
              return (
                <Input.Group key={key} compact style={{ marginBottom: 5 }}>
                  <Form.Item noStyle {...restField} name={[name, 'color']}>
                    <Input type='color' style={{ width: 50, padding: 0 }} />
                  </Form.Item>
                  <Form.Item noStyle {...restField} name={[name, 'value']}>
                    <InputNumber style={{ width: 430 }} />
                  </Form.Item>
                  <Button
                    style={{ width: 50 }}
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      remove(name);
                    }}
                  />
                </Input.Group>
              );
            })}
          </>
        )}
      </Form.List>
    </Panel>
  );
}
