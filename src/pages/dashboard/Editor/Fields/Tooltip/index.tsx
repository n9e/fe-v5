import React from 'react';
import { Collapse, Form, Radio } from 'antd';
import _ from 'lodash';

const { Panel } = Collapse;

export default function index(props) {
  const namePrefix = ['options', 'tooltip'];

  return (
    <Panel {...props} header='Tooltip' key='tooltip'>
      <div>
        <Form.Item label='模式' name={[...namePrefix, 'mode']}>
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value='single'>单值</Radio.Button>
            <Radio.Button value='all'>所有</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'mode']) !== _.get(curValues, [...namePrefix, 'mode'])}>
          {({ getFieldValue }) => {
            if (getFieldValue([...namePrefix, 'mode']) === 'all') {
              return (
                <Form.Item label='排序' name={[...namePrefix, 'sort']}>
                  <Radio.Group buttonStyle='solid'>
                    <Radio.Button value='none'>不排序</Radio.Button>
                    <Radio.Button value='asc'>升序</Radio.Button>
                    <Radio.Button value='desc'>降序</Radio.Button>
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
