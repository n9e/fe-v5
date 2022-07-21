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
import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import { useSize } from 'ahooks';
import { IPanel } from '../../../types';
import { statHexPalette } from '../../../config';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
}

export default function BarGauge(props: IProps) {
  const { values, series, themeMode } = props;
  const { custom, options } = values;
  const { calc, textMode, colorMode, colSpan, textSize } = custom;
  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      unit: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
    },
    options?.valueMappings,
  );

  console.log(calculatedValues);

  return (
    <div className='renderer-stat-container'>
      <div className='renderer-stat-container-box scroll-container'>barGauge</div>
    </div>
  );
}
