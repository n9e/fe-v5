import React from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import Timeseries from './Timeseries';
import Stat from './Stat';

export default function index() {
  const OptionsCptMap = {
    timeseries: <Timeseries />,
    stat: <Stat />,
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
