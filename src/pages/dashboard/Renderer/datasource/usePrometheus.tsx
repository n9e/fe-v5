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
import * as api from '@/components/Graph/api';
import { Range, formatPickerDate } from '@/components/DateRangePicker';
import { ITarget } from '../../types';
import { replaceExpressionVars, getVaraiableSelected } from '../../VariableConfig/constant';
import { IVariable } from '../../VariableConfig/definition';
import replaceExpressionBracket from '../utils/replaceExpressionBracket';
import { completeBreakpoints } from './utils';

interface IProps {
  id?: string;
  dashboardId: string;
  time: Range;
  step: number | null;
  targets: ITarget[];
  variableConfig?: IVariable[];
  inViewPort?: boolean;
}

const getSerieName = (metric: Object, expr: string) => {
  let name = metric['__name__'] || '';
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  return _.trim(name);
};

export default function usePrometheus(props: IProps) {
  const { id, dashboardId, time, step, targets, variableConfig, inViewPort } = props;
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const cachedVariableValues = _.map(variableConfig, (item) => {
    return getVaraiableSelected(item.name, dashboardId);
  });
  const flag = useRef(false);
  let { start, end } = formatPickerDate(time);
  let _step = step;
  if (!step) _step = Math.max(Math.floor((end - start) / 250), 1); // TODO: 这个默认 step 不知道是基于什么计算的，并且是一个对用户透明可能存在理解问题
  start = start - (start % _step!);
  end = end - (end % _step!);

  const fetchData = () => {
    const _series: any[] = [];
    const promises: Promise<any>[] = [];
    _.forEach(targets, (target) => {
      if (target.time) {
        const { start: _start, end: _end } = formatPickerDate(target.time);
        start = _start;
        end = _end;
      }
      if (target.step) {
        _step = target.step;
      }
      const realExpr = variableConfig ? replaceExpressionVars(target.expr, variableConfig, variableConfig.length, dashboardId) : target.expr;
      const signalKey = `${id}-${target.expr}`;
      if (realExpr) {
        promises.push(
          api
            .fetchHistory(
              {
                start,
                end,
                step: _step,
                query: realExpr,
              },
              signalKey,
            )
            .then((res) => {
              return {
                result: res?.data?.result,
                expr: target.expr,
                refId: target.refId,
              };
            }),
        );
      }
    });
    setLoading(true);
    Promise.all(promises)
      .then((res) => {
        _.forEach(res, (item) => {
          const target = _.find(targets, (t) => t.expr === item.expr);
          _.forEach(item.result, (serie) => {
            _series.push({
              id: _.uniqueId('series_'),
              refId: item.refId,
              name: target?.legend ? replaceExpressionBracket(target?.legend, serie.metric) : getSerieName(serie.metric, item.expr),
              metric: serie.metric,
              expr: item.expr,
              data: completeBreakpoints(_step, serie.values),
            });
          });
        });
        setSeries(_series);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (inViewPort) {
      fetchData();
    } else {
      flag.current = false;
    }
  }, [JSON.stringify(_.map(targets, 'expr')), start, end, step, JSON.stringify(variableConfig), JSON.stringify(cachedVariableValues)]);

  useEffect(() => {
    if (inViewPort && !flag.current) {
      flag.current = true;
      fetchData();
    }
  }, [inViewPort]);

  useEffect(() => {
    const _series = _.map(series, (item) => {
      const target = _.find(targets, (t) => t.expr === item.expr);
      return {
        ...item,
        name: target?.legend ? replaceExpressionBracket(target?.legend, item.metric) : getSerieName(item.metric, item.expr),
      };
    });
    setSeries(_series);
  }, [JSON.stringify(_.map(targets, 'legend'))]);

  return { series, loading };
}
