import React from 'react';
import { Range } from '@/components/DateRangePicker';
import { IPanel } from '../types';
import Timeseries from './Timeseries';
import Stat from './Stat';
import { VariableType } from '../VariableConfig';

interface IProps {
  time: Range;
  step: number | null;
  values: IPanel;
  variableConfig?: VariableType;
}

export default function index(props: IProps) {
  const {
    values: { type },
  } = props;
  const RendererCptMap = {
    timeseries: <Timeseries {...props} />,
    stat: <Stat {...props} />,
  };
  return <div style={{ border: '1px solid #d9d9d9', height: 200 }}>{RendererCptMap[type] || `无效的图表类型 ${type}`}</div>;
}
