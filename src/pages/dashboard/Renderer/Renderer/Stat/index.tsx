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

interface IProps {
  time: Range;
  step: number | null;
  values: IPanel;
  variableConfig?: VariableType;
}

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
