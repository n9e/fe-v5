import React, { useRef } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';
import { Range } from '@/components/DateRangePicker';
import usePrometheus from '../../datasource/usePrometheus';
import { IPanel } from '../../../types';
import { VariableType } from '../../../VariableConfig';
import { hexPalette } from '../../../config';
import valueFormatter from '../../utils/valueFormatter';
import './style.less';

interface IProps {
  time: Range;
  step: number | null;
  values: IPanel;
  variableConfig?: VariableType;
}

const getValueAndToNumber = (value: any[]) => {
  return _.toNumber(_.get(value, 1, NaN));
};

const getCalculatedValuesBySeries = (series: any[], calc: string, { util, decimals }) => {
  return _.map(series, (serie) => {
    const results = {
      lastNotNull: () => getValueAndToNumber(_.last(_.filter(serie.data, (item) => item[1] !== null))),
      last: () => getValueAndToNumber(_.last(serie.data)),
      firstNotNull: () => getValueAndToNumber(_.first(_.filter(serie.data, (item) => item[1] !== null))),
      first: () => getValueAndToNumber(_.first(serie.data)),
      min: () => getValueAndToNumber(_.minBy(serie.data, (item) => _.toNumber(item[1]))),
      max: () => getValueAndToNumber(_.maxBy(serie.data, (item) => _.toNumber(item[1]))),
      avg: () => _.meanBy(serie.data, (item) => _.toNumber(item[1])),
      sum: () => _.sumBy(serie.data, (item) => _.toNumber(item[1])),
      count: () => _.size(serie.data),
    };
    const stat = results[calc] ? results[calc]() : NaN;
    return {
      name: serie.name,
      stat: valueFormatter({ util, decimals }, stat),
    };
  });
};

function StatItem(props) {
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const { item, idx, colSpan, textMode, colorMode, textSize } = props;
  const headerFontSize = textSize?.title ? textSize?.title : eleSize?.width! / _.toString(item.name).length || 12;
  const statFontSize = textSize?.value ? textSize?.value : eleSize?.width! / _.toString(item.stat).length || 12;
  return (
    <div
      key={item.name}
      className='renderer-stat-item'
      ref={ele}
      style={{
        width: `${100 / colSpan}%`,
        flexBasis: `${100 / colSpan}%`,
        backgroundColor: colorMode === 'background' ? hexPalette[idx % hexPalette.length] : 'transparent',
      }}
    >
      <div className='renderer-stat-item-content'>
        {textMode === 'valueAndName' && (
          <div
            className='renderer-stat-header'
            style={{
              fontSize: headerFontSize > 100 ? 100 : headerFontSize,
            }}
          >
            {item.name}
          </div>
        )}
        <div
          className='renderer-stat-value'
          style={{
            color: colorMode === 'value' ? hexPalette[idx % hexPalette.length] : '#fff',
            fontSize: statFontSize > 100 ? 100 : statFontSize,
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
  const { calc, textMode, colorMode, colSpan, textSize } = custom;
  const { series } = usePrometheus({
    time,
    step,
    targets,
    variableConfig,
  });
  const calculatedValues = getCalculatedValuesBySeries(series, calc, {
    util: options?.standardOptions?.util,
    decimals: options?.standardOptions?.decimals,
  });

  return (
    <div className='renderer-stat-container'>
      <div className='renderer-stat-container-box'>
        {_.map(calculatedValues, (item, idx) => {
          return <StatItem key={item.name} item={item} idx={idx} colSpan={colSpan} textMode={textMode} colorMode={colorMode} textSize={textSize} />;
        })}
      </div>
    </div>
  );
}
