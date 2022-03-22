import React, { useRef } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';
import { Range } from '@/components/DateRangePicker';
import { IPanel } from '../../../types';
import { VariableType } from '../../../VariableConfig';
import { hexPalette } from '../../../config';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import './style.less';

interface IProps {
  id: string;
  time: Range;
  step: number | null;
  values: IPanel;
  series: any[];
  variableConfig?: VariableType;
}

function StatItem(props) {
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const { item, idx, colSpan, textMode, colorMode, textSize } = props;
  const headerFontSize = textSize?.title ? textSize?.title : eleSize?.width! / _.toString(item.name).length || 12;
  let statFontSize = textSize?.value ? textSize?.value : eleSize?.width! / _.toString(item.text).length || 12;
  const color = item.color ? item.color : hexPalette[idx % hexPalette.length];

  if (statFontSize > eleSize?.height! - 20) {
    statFontSize = eleSize?.height! - 20;
  }

  return (
    <div
      key={item.name}
      className='renderer-stat-item'
      ref={ele}
      style={{
        width: `${100 / colSpan}%`,
        flexBasis: `${100 / colSpan}%`,
        backgroundColor: colorMode === 'background' ? color : 'transparent',
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
            color: colorMode === 'value' ? color : '#fff',
            fontSize: statFontSize > 100 ? 100 : statFontSize,
          }}
        >
          {item.text}
        </div>
      </div>
    </div>
  );
}

export default function Stat(props: IProps) {
  const { values, series } = props;
  const { custom, options } = values;
  const { calc, textMode, colorMode, colSpan, textSize } = custom;
  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      util: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
    },
    options?.valueMappings,
  );

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
