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
import moment from 'moment';
import { formatPickerDate } from '@/components/DateRangePicker'; // TODO: 兼容旧版本
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { ITarget } from '../../types';
import { replaceExpressionVars, getVaraiableSelected } from '../../VariableConfig/constant';
import { IVariable } from '../../VariableConfig/definition';
import replaceExpressionBracket from '../utils/replaceExpressionBracket';
import { completeBreakpoints } from './utils';
import { fetchHistoryBatch } from '@/components/Graph/api';

interface IProps {
  id?: string;
  dashboardId: string;
  time: IRawTimeRange;
  step: number | null;
  targets: ITarget[];
  variableConfig?: IVariable[];
  inViewPort?: boolean;
}

interface QueryMetricItem {
  start: number;
  end: number;
  step: number;
  query: string;
}

const getSerieName = (metric: Object, expr: string) => {
  let name = metric['__name__'] || '';
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  return _.trim(name);
};
const getDefaultStepByStartAndEnd = (start: number, end: number) => {
  return Math.max(Math.floor((end - start) / 240), 1);
};

export default function usePrometheus(props: IProps) {
  const { id, dashboardId, time, step, targets, variableConfig, inViewPort } = props;
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const cachedVariableValues = _.map(variableConfig, (item) => {
    return getVaraiableSelected(item.name, dashboardId);
  });
  const flag = useRef(false);
  const [times, setTimes] = useState<any>({});

  const fetchData = () => {
    if (!times.start) return;
    const _series: any[] = [];
    let { start, end, step } = times;
    let batchParams: Array<QueryMetricItem> = [];
    let exprs: Array<string> = [];
    let refIds: Array<string> = [];
    let signalKey = `${id}`;
    if (targets) {
      _.forEach(targets, (target) => {
        if (target.time) {
          // TODO: 兼容旧版本
          if (target.time.unit) {
            const { start: _start, end: _end } = formatPickerDate(target.time);
            start = _start;
            end = _end;
          } else {
            const parsedRange = parseRange(target.time);
            start = moment(parsedRange.start).unix();
            end = moment(parsedRange.end).unix();
          }
          step = getDefaultStepByStartAndEnd(start, end);
          if (target.step) {
            step = target.step;
          }
        }

        start = start - (start % step!);
        end = end - (end % step!);

        const realExpr = variableConfig ? replaceExpressionVars(target.expr, variableConfig, variableConfig.length, dashboardId) : target.expr;
        if (realExpr) {
          batchParams.push({
            end: end,
            query: realExpr,
            start: start,
            step: step,
          });
          exprs.push(target.expr);
          refIds.push(target.refId);
          signalKey += `-${target.expr}`;
        }
      });
      setLoading(true);
      fetchHistoryBatch({ queries: batchParams }, signalKey)
        .then((res) => {
          for (let i = 0; i < res.dat?.length; i++) {
            var item = {
              result: res.dat[i],
              expr: exprs[i],
              refId: refIds[i],
            };
            const target = _.find(targets, (t) => t.expr === item.expr);
            _.forEach(item.result, (serie) => {
              _series.push({
                id: _.uniqueId('series_'),
                refId: item.refId,
                name: target?.legend ? replaceExpressionBracket(target?.legend, serie.metric) : getSerieName(serie.metric, item.expr),
                metric: serie.metric,
                expr: item.expr,
                data: completeBreakpoints(step, serie.values),
              });
            });
          }
          setSeries(_series);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    const parsedRange = parseRange(time);
    let start = moment(parsedRange.start).unix();
    let end = moment(parsedRange.end).unix();
    let _step = step;
    if (!step) _step = getDefaultStepByStartAndEnd(start, end);
    start = start - (start % _step!);
    end = end - (end % _step!);
    setTimes({
      start,
      end,
      step: _step,
    });
  }, [JSON.stringify(time)]);

  useEffect(() => {
    if (inViewPort) {
      fetchData();
    } else {
      flag.current = false;
    }
  }, [JSON.stringify(_.map(targets, 'expr')), JSON.stringify(times), step, JSON.stringify(variableConfig), JSON.stringify(cachedVariableValues)]);

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
