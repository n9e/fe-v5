import React from 'react';
import { Range } from '@/components/DateRangePicker';
import { IPanel } from '../types';
import Timeseries from './Timeseries';
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
  };
  return RendererCptMap[type] || <div style={{ height: 200, border: '1px solid #d9d9d9' }}>`无效的图表类型 ${type}`</div>;
}
