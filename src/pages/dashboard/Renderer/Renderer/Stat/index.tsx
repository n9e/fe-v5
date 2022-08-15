/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useRef, useState, useContext } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import { useSize } from 'ahooks';
import { IPanel } from '../../../types';
import { statHexPalette } from '../../../config';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { Context } from '../../../Context';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  containerRef: {
    current: HTMLDivElement | null;
  };
  themeMode?: 'dark';
}

const UNIT_SIZE = 12;
const MIN_SIZE = 12;
const UNIT_PADDING = 4;
const getTextColor = (color, colorMode, isFullSizeBackground, themeMode) => {
  return colorMode === 'value' ? color : '#fff';
};

function StatItem(props) {
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const { item, idx, colSpan, textMode, colorMode, textSize, isFullSizeBackground, themeMode, valueField = 'Value' } = props;
  const headerFontSize = textSize?.title ? textSize?.title : eleSize?.width! / _.toString(item.name).length || MIN_SIZE;
  let statFontSize = textSize?.value ? textSize?.value : (eleSize?.width! - item.unit.length * UNIT_SIZE - UNIT_PADDING) / _.toString(item.value).length || MIN_SIZE;
  const color = item.color ? item.color : statHexPalette[idx % statHexPalette.length];
  const backgroundColor = colorMode === 'background' ? color : 'transparent';

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
        backgroundColor: isFullSizeBackground ? 'transparent' : backgroundColor,
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
            color: getTextColor(color, colorMode, isFullSizeBackground, themeMode),
            fontSize: statFontSize > 100 ? 100 : statFontSize,
          }}
        >
          {valueField === 'Value' ? (
            <>
              {item.value}
              <span style={{ fontSize: UNIT_SIZE, paddingLeft: UNIT_PADDING }}>{item.unit}</span>
            </>
          ) : (
            _.get(item, ['metric', valueField])
          )}
        </div>
      </div>
    </div>
  );
}

const getColumnsKeys = (data: any[]) => {
  const keys = _.reduce(
    data,
    (result, item) => {
      return _.union(result, _.keys(item.metric));
    },
    [],
  );
  return _.uniq(keys);
};

export default function Stat(props: IProps) {
  const { dispatch } = useContext(Context);
  const { values, series, containerRef, themeMode } = props;
  const { custom, options } = values;
  const { calc, textMode, colorMode, colSpan, textSize, valueField } = custom;
  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      unit: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
      dateFormat: options?.standardOptions?.dateFormat,
    },
    options?.valueMappings,
  );
  const [isFullSizeBackground, setIsFullSizeBackground] = useState(false);

  // 只有单个序列值且是背景色模式，则填充整个卡片的背景色
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'updateMetric',
        payload: getColumnsKeys(calculatedValues),
      });
    }
    if (calculatedValues.length === 1 && colorMode === 'background' && containerRef.current) {
      const head = _.head(calculatedValues);
      const color = head.color ? head.color : statHexPalette[0];
      const colorObject = d3.color(color);
      containerRef.current.style.border = `1px solid ${colorObject + ''}`;
      containerRef.current.style.backgroundColor = colorObject + '';
      containerRef.current.style.color = '#fff';
      setIsFullSizeBackground(true);
    } else {
      setIsFullSizeBackground(false);
    }
  }, [JSON.stringify(calculatedValues), colorMode]);

  return (
    <div className='renderer-stat-container'>
      <div className='renderer-stat-container-box scroll-container'>
        {_.map(calculatedValues, (item, idx) => {
          return (
            <StatItem
              key={item.name}
              item={item}
              idx={idx}
              colSpan={colSpan}
              textMode={textMode}
              colorMode={colorMode}
              textSize={textSize}
              isFullSizeBackground={isFullSizeBackground}
              themeMode={themeMode}
              valueField={valueField}
            />
          );
        })}
      </div>
    </div>
  );
}
