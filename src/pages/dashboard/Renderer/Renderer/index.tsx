import React from 'react';
import _ from 'lodash';
import { Range } from '@/components/DateRangePicker';
import Timeseries from './Timeseries';
import Stat from './Stat';
import Table from './Table';
import { VariableType } from '../../VariableConfig';

interface IProps {
  time: Range;
  step: number | null;
  type: string;
  values: any;
  variableConfig?: VariableType;
}

function index(props: IProps) {
  const { time, step, type, variableConfig, values } = props;
  const subProps = {
    time,
    step,
    variableConfig,
    values,
  };
  if (_.isEmpty(values)) return null;
  const RendererCptMap = {
    timeseries: <Timeseries {...subProps} />,
    stat: <Stat {...subProps} />,
    table: <Table {...subProps} />,
  };
  return <div style={{ border: '1px solid #d9d9d9', height: 200 }}>{RendererCptMap[type] || `无效的图表类型 ${type}`}</div>;
}

export default index;
