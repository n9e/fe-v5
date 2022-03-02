import React from 'react';
import { Collapse, Form, Radio, Switch } from 'antd';
import _ from 'lodash';

const { Panel } = Collapse;

export default function index(props) {
  const namePrefix = ['options', 'legend'];

  return (
    <Panel {...props} header='Legend' key='legend'>
      <div>
        <Form.Item
          label='显示'
          name={[...namePrefix, 'displayMode']}
          valuePropName='checked'
          normalize={(value) => {
            return value === 'list';
          }}
          getValueFromEvent={(val) => {
            return !!val ? 'list' : 'hidden';
          }}
        >
          <Switch />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
          {({ getFieldValue }) => {
            if (getFieldValue([...namePrefix, 'displayMode']) === true) {
              return (
                <Form.Item label='位置' name={[...namePrefix, 'placement']}>
                  <Radio.Group buttonStyle='solid'>
                    <Radio.Button value='right'>right</Radio.Button>
                    <Radio.Button value='bottom'>bottom</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>
      </div>
    </Panel>
  );
}
