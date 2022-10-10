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
import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import { useSize } from 'ahooks';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { useGlobalState } from '../../../globalState';
import Gauge from './Gauge';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
}

const MIN_SIZE = 12;

function GaugeItemContent(props) {
  const { eleSize, realHeaderFontSize, item, themeMode, thresholds } = props;
  const height = eleSize?.height! - realHeaderFontSize;
  const width = eleSize?.width! > height ? height : eleSize?.width;

  if (!eleSize?.width) return null;

  return (
    <div className='renderer-gauge-item-content-chart'>
      <Gauge
        value={item.stat}
        formatedValue={item.value}
        valueUnit={item.unit}
        color={item.color}
        bgColor={themeMode === 'dark' ? '#404456' : '#eeeeee'}
        width={width}
        height={width}
        thresholds={thresholds}
      />
    </div>
  );
}

function GaugeItemLabel(props) {
  const { eleSize, realHeaderFontSize, name } = props;

  if (!eleSize?.width) return null;
  return (
    <div
      className='renderer-gauge-header'
      style={{
        width: eleSize?.width,
        fontSize: realHeaderFontSize > 24 ? 24 : realHeaderFontSize,
      }}
    >
      {name}
    </div>
  );
}

function GaugeItem(props) {
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const { item, colSpan, textMode = 'valueAndName' } = props;
  const headerFontSize = eleSize?.width! / _.toString(item.name).length || MIN_SIZE;
  const realHeaderFontSize = headerFontSize > 24 ? 24 : headerFontSize;

  return (
    <div
      key={item.name}
      className='renderer-gauge-item'
      ref={ele}
      style={{
        width: `${100 / colSpan}%`,
        flexBasis: `${100 / colSpan}%`,
      }}
    >
      <div className='renderer-gauge-item-content'>
        <GaugeItemContent {...props} eleSize={eleSize} realHeaderFontSize={realHeaderFontSize} />
        {textMode === 'valueAndName' && <GaugeItemLabel eleSize={eleSize} realHeaderFontSize={realHeaderFontSize} name={item.name} />}
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

export default function Index(props: IProps) {
  const { values, series, themeMode } = props;
  const { custom, options } = values;
  const { calc, textMode } = custom;
  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      unit: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
      dateFormat: options?.standardOptions?.dateFormat,
    },
    options?.valueMappings,
    options?.thresholds,
  );
  const [statFields, setStatFields] = useGlobalState('statFields');

  useEffect(() => {
    setStatFields(getColumnsKeys(calculatedValues));
  }, [JSON.stringify(calculatedValues)]);

  return (
    <div className='renderer-gauge-container'>
      <div className='renderer-gauge-container-box scroll-container'>
        {_.map(calculatedValues, (item, idx) => {
          return <GaugeItem key={item.name} item={item} idx={idx} textMode={textMode} themeMode={themeMode} thresholds={options.thresholds} />;
        })}
      </div>
    </div>
  );
}
