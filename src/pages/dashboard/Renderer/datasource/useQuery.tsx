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
import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { ITarget } from '../../types';
import { getVaraiableSelected } from '../../VariableConfig/constant';
import { IVariable } from '../../VariableConfig/definition';
import replaceExpressionBracket from '../utils/replaceExpressionBracket';
import { getSerieName } from './utils';
import prometheusQuery from './prometheus';
import elasticSearchQuery from './elasticSearch';
import elasticSearchLogQuery from './elasticSearchLog';

interface IProps {
  id?: string;
  dashboardId: string;
  datasourceCate: string;
  datasourceName: string;
  time: IRawTimeRange;
  step: number | null;
  targets: ITarget[];
  variableConfig?: IVariable[];
  inViewPort?: boolean;
  spanNulls?: boolean;
}

export default function usePrometheus(props: IProps) {
  const { dashboardId, datasourceCate, time, step, targets, variableConfig, inViewPort, spanNulls, datasourceName } = props;
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const cachedVariableValues = _.map(variableConfig, (item) => {
    return getVaraiableSelected(item.name, dashboardId);
  });
  const flag = useRef(false);
  const fetchQueryMap = {
    prometheus: prometheusQuery,
    elasticsearch: elasticSearchQuery,
    'elasticsearch-log': elasticSearchLogQuery,
  };
  const fetchData = () => {
    if (!datasourceCate) return;
    setLoading(true);
    fetchQueryMap[datasourceCate](props)
      .then((res: any[]) => {
        setSeries(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // 配置变化时且图表在可视区域内重新请求数据，同时重置 flag
    if (inViewPort) {
      fetchData();
    } else {
      flag.current = false;
    }
  }, [JSON.stringify(targets), JSON.stringify(time), step, JSON.stringify(variableConfig), JSON.stringify(cachedVariableValues), spanNulls, datasourceName]);

  useEffect(() => {
    // 如果图表在可视区域内并且没有请求过数据，则请求数据
    if (inViewPort && !flag.current) {
      flag.current = true;
      fetchData();
    }
  }, [inViewPort]);

  useEffect(() => {
    // 目前只有 prometheus 支持 legend 替换
    const _series = _.map(series, (item) => {
      const target = _.find(targets, (t) => t.expr === item.expr);
      return {
        ...item,
        name: target?.legend ? replaceExpressionBracket(target?.legend, item.metric) : getSerieName(item.metric),
      };
    });
    setSeries(_series);
  }, [JSON.stringify(_.map(targets, 'legend'))]);

  return { series, loading };
}
