/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
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
