import React from 'react';
import { Form, Radio, Select } from 'antd';
import _ from 'lodash';
import { Panel } from '../../Components/Collapse';

export const calcsOptions = {
  lastNotNull: {
    name: '最后一个非空值',
  },
  last: {
    name: '最后一个值',
  },
  firstNotNull: {
    name: '第一个非空值',
  },
  first: {
    name: '第一个值',
  },
  min: {
    name: '最小值',
  },
  max: {
    name: '最大值',
  },
  avg: {
    name: '平均值',
  },
  sum: {
    name: '总和',
  },
  count: {
    name: '数量',
  },
};

const colSpans = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function GraphStyles() {
  const namePrefix = ['custom'];

  return (
    <Panel header='图表样式'>
      <>
        <Form.Item label='显示模式' name={[...namePrefix, 'textMode']}>
          <Radio.Group buttonStyle='solid'>
            <Radio.Button value='valueAndName'>名称和值</Radio.Button>
            <Radio.Button value='value'>值</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label='取值计算' name={[...namePrefix, 'calc']}>
          <Select>
            {_.map(calcsOptions, (item, key) => {
              return (
                <Select.Option key={key} value={key}>
                  {item.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item label='每行显示' name={[...namePrefix, 'colSpan']}>
          <Select>
            {_.map(colSpans, (item) => {
              return (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </>
    </Panel>
  );
}
