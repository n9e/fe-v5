import React from 'react';
import { Collapse, Form, Radio } from 'antd';
import _ from 'lodash';

const { Panel } = Collapse;

export default function index(props) {
  const namePrefix = ['options', 'thresholds'];

  return (
    <Panel {...props} header='阈值设置' key='thresholds'>
      <div></div>
    </Panel>
  );
}
