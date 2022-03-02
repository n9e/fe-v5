import React from 'react';
import { Form } from 'antd';
import Timeseries from './Timeseries';

export default function index(props) {
  const OptionsCptMap = {
    timeseries: <Timeseries {...props} />, // TODO: 这里需要手动把 props 传递给 Collapse.Panel，不是很优雅后面看下怎么处理（(`A´)花了好久定位这个问题）
  };
  return (
    <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.type !== curValues.type}>
      {({ getFieldValue }) => {
        const type = getFieldValue('type');
        return OptionsCptMap[type] || `无效的图表类型 ${type}`;
      }}
    </Form.Item>
  );
}
