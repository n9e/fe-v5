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
import * as React from 'react';
import { useEffect, useRef, FunctionComponent } from 'react';
import _ from 'lodash';
import * as d3 from 'd3';
import { useSize } from 'ahooks';
import { renderFn } from './render';
import { IPanel, IHexbinStyles } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { getColorScaleLinearDomain } from './utils';
import './style.less';

interface HoneyCombProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
}

const Hexbin: FunctionComponent<HoneyCombProps> = (props) => {
  const { values, series, themeMode } = props;
  const { custom = {}, options } = values;
  const { calc, colorRange = [], reverseColorOrder = false, colorDomainAuto, colorDomain, textMode = 'valueAndName' } = custom as IHexbinStyles;
  const groupEl = useRef<SVGGElement>(null);
  const svgEl = useRef<HTMLDivElement>(null);
  const svgSize = useSize(svgEl);

  useEffect(() => {
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
    const colorScales = d3
      .scaleLinear()
      .domain(getColorScaleLinearDomain(calculatedValues, colorDomainAuto, colorDomain))
      .range(reverseColorOrder ? _.reverse(_.slice(colorRange)) : colorRange);

    if (svgSize?.width && svgSize?.height) {
      const renderProps = {
        width: svgSize?.width,
        height: svgSize?.height,
        parentGroupEl: groupEl.current,
        themeMode,
        textMode,
      };
      const data = _.map(calculatedValues, (item) => {
        return {
          ...item,
          value: item.text,
          color: item.color || colorScales(item.stat) || '#3399CC',
        };
      });
      d3.select(groupEl.current).selectAll('*').remove();
      if (data.length) {
        renderFn(data, renderProps);
      }
    }
  }, [JSON.stringify(series), JSON.stringify(options), svgSize?.width, svgSize?.height, calc, colorRange, reverseColorOrder, colorDomainAuto, colorDomain]);
  return (
    <div ref={svgEl} style={{ width: '100%', height: '100%' }}>
      <svg style={{ width: '100%', height: '100%' }}>
        <g ref={groupEl} />
      </svg>
    </div>
  );
};

export default Hexbin;
