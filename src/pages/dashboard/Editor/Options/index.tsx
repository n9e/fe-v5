import React from 'react';
import { Form } from 'antd';
import Timeseries from './Timeseries';

export default function index(props) {
  const OptionsCptMap = {
    timeseries: <Timeseries {...props} />,
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
