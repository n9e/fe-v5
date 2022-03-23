import React from 'react';
import { Form, Space, Input, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import ValueMappings from '../ValueMappings';
import StandardOptions from '../StandardOptions';

export default function index() {
  const namePrefix = ['overrides'];

  return (
    <Form.List name={namePrefix}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => {
            return (
              <Panel
                header='override'
                extra={
                  <Space>
                    <PlusCircleOutlined
                      onClick={() => {
                        add({
                          type: 'special',
                        });
                      }}
                    />
                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(name);
                        }}
                      />
                    )}
                  </Space>
                }
              >
                <Form.Item label='指标名称' {...restField} name={[name, 'matcher', 'value']}>
                  <Input />
                </Form.Item>
                <ValueMappings preNamePrefix={namePrefix} namePrefix={[name, 'properties', 'valueMappings']} />
                <StandardOptions preNamePrefix={namePrefix} namePrefix={[name, 'properties', 'standardOptions']} />
              </Panel>
            );
          })}
        </>
      )}
    </Form.List>
  );
}
