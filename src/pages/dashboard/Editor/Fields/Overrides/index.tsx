import React from 'react';
import { Form, Space, Input, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';
import ValueMappings from '../ValueMappings';
import StandardOptions from '../StandardOptions';

export default function index({ targets }) {
  const namePrefix = ['overrides'];

  return (
    <Form.List name={namePrefix}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => {
            return (
              <Panel
                isInner
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
                <Form.Item label='查询条件名称' {...restField} name={[name, 'matcher', 'value']}>
                  <Select allowClear>
                    {_.map(targets, (target) => {
                      return (
                        <Select.Option key={target.refId} value={target.refId}>
                          {target.refId}
                        </Select.Option>
                      );
                    })}
                  </Select>
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
