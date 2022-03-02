import React from 'react';
import { Collapse } from 'antd';
import Tooltip from '../../Fields/Tooltip';
import Legend from '../../Fields/Legend';
import GraphStyles from './GraphStyles';
import StandardOptions from '../../Fields/StandardOptions';

interface IProps {}

const { Panel } = Collapse;

export default function Timeseries(props: IProps) {
  return (
    <>
      <Tooltip {...props} />
      <Legend {...props} />
      <GraphStyles {...props} />
      <StandardOptions {...props} />
    </>
  );
}
