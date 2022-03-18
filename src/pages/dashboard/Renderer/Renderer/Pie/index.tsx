import React, { useRef } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';
import { Range } from '@/components/DateRangePicker';
import usePrometheus from '../../datasource/usePrometheus';
import { IPanel } from '../../../types';
import { VariableType } from '../../../VariableConfig';
import { hexPalette } from '../../../config';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import './style.less';
import G2PieChart from '@/components/G2PieChart';

interface IProps {
  time: Range;
  step: number | null;
  values: IPanel;
  variableConfig?: VariableType;
}

export default function Pie(props: IProps) {
  const { values, time, step, variableConfig } = props;
  const { targets, custom, options } = values;
  const { calc, legengPosition, max } = custom;
  const { series } = usePrometheus({
    time,
    step,
    targets,
    variableConfig,
  });
  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      util: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
    },
    options?.valueMappings,
  );

  const sortedValues = calculatedValues.sort((a, b) => b.value - a.value);
  const data =
    max && sortedValues.length > max
      ? sortedValues
          .slice(0, max)
          .map((i) => ({ name: i.name, value: i.stat }))
          .concat({ name: '其他', value: sortedValues.slice(max).reduce((previousValue, currentValue) => currentValue.stat + previousValue, 0) })
      : sortedValues.map((i) => ({ name: i.name, value: i.stat }));
  return (
    <div className='renderer-pie-container'>
      <G2PieChart data={data} positon={legengPosition !== 'hidden' ? legengPosition : undefined} hidden={legengPosition === 'hidden'} />
    </div>
  );
}
