import React from 'react';
import { Form, Radio, Switch } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';

export default function index() {
  const namePrefix = ['options', 'legend'];

  return (
    <Panel header='Legend'>
      <>
        <Form.Item noStyle label='' name={[...namePrefix, 'displayMode']}>
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value='table'>开启</Radio.Button>
            <Radio.Button value='hidden'>关闭</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {/*目前只有 table 形态的 legend，后面支持 list 形态后再打开下面的位置设置*/}
        {/* <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'displayMode']) !== _.get(curValues, [...namePrefix, 'displayMode'])}>
          {({ getFieldValue }) => {
            if (getFieldValue([...namePrefix, 'displayMode']) === 'list') {
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
        </Form.Item> */}
      </>
    </Panel>
  );
}
