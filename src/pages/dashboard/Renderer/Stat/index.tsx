import React, { useRef } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';
import { Range } from '@/components/DateRangePicker';
import usePrometheus from '../datasource/usePrometheus';
import { IPanel } from '../../types';
import * as byteConverter from '../utils/byteConverter';
import { VariableType } from '../../VariableConfig';
import { hexPalette } from '../../config';
import './style.less';

interface IProps {
  time: Range;
  step: number | null;
  values: IPanel;
  variableConfig?: VariableType;
}

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

const getCalculatedValuesBySeries = (series: any[], calcs: string) => {
  return _.map(series, (serie) => {
    const results = {
      lastNotNull: () => _.toNumber(_.get(_.last(_.filter(serie.data, (item) => item[1] !== null)), 1, NaN)),
      last: () => _.toNumber(_.get(_.last(serie.data), 1, NaN)),
      firstNotNull: () => _.toNumber(_.get(_.first(_.filter(serie.data, (item) => item[1] !== null)), 1, NaN)),
      first: () => _.toNumber(_.get(_.first(serie.data), 1, NaN)),
      min: () => _.minBy(serie.data, (item) => _.toNumber(item[1])),
      max: () => _.maxBy(serie.data, (item) => _.toNumber(item[1])),
      avg: () => _.meanBy(serie.data, (item) => _.toNumber(item[1])),
      sum: () => _.sumBy(serie.data, (item) => _.toNumber(item[1])),
      count: () => _.size(serie.data),
    };
    return {
      name: serie.name,
      stat: results[calcs] ? results[calcs]() : NaN,
    };
  });
};

function StatItem(props) {
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const { item, idx } = props;
  const headerFontSize = eleSize?.width! / _.toString(item.name).length;
  const statFontSize = eleSize?.width! / _.toString(item.stat).length;
  return (
    <div key={item.name} className='renderer-stat-item' ref={ele}>
      <div className='renderer-stat-item-content'>
        <div
          className='renderer-stat-header'
          style={{
            fontSize: headerFontSize,
          }}
        >
          {item.name}
        </div>
        <div
          className='renderer-stat-value'
          style={{
            color: hexPalette[idx],
            fontSize: statFontSize,
          }}
        >
          {item.stat}
        </div>
      </div>
    </div>
  );
}

export default function Stat(props: IProps) {
  const { values, time, step, variableConfig } = props;
  const { targets, custom, options } = values;
  const chartEleRef = useRef<HTMLDivElement>(null);
  const { series } = usePrometheus({
    time,
    step,
    targets,
    variableConfig,
  });
  const calcs = 'lastNotNull';
  const calculatedValues = getCalculatedValuesBySeries(series, calcs);
  return (
    <div className='renderer-stat-container'>
      <div className='renderer-stat-container-box'>
        {_.map(calculatedValues, (item, idx) => {
          return <StatItem item={item} idx={idx} />;
        })}
      </div>
    </div>
  );
}
