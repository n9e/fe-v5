import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import * as api from '@/components/Graph/api';
import { Range, formatPickerDate } from '@/components/DateRangePicker';
import { ITarget } from '../../types';
import { VariableType } from '../../VariableConfig';
import { replaceExpressionVars } from '../../VariableConfig/constant';
import replaceExpressionBracket from '../utils/replaceExpressionBracket';

interface IProps {
  time: Range;
  step: number | null;
  targets: ITarget[];
  variableConfig?: VariableType;
}

const getSerieName = (metric: Object, expr: string) => {
  let name = metric['__name__'];
  if (_.keys(metric).length === 0) {
    name = expr;
  }
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  return name;
};

export default function usePrometheus(props: IProps) {
  const { time, step, targets, variableConfig } = props;
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    const { start, end } = formatPickerDate(time);
    let _step = step;
    if (!step) _step = Math.max(Math.floor((end - start) / 250), 1);
    const _series: any[] = [];
    const promises = _.map(targets, (target) => {
      const realExpr = variableConfig ? replaceExpressionVars(target.expr, variableConfig, variableConfig.var.length) : target.expr;
      return api
        .fetchHistory({
          start,
          end,
          step: _step,
          query: realExpr,
        })
        .then((res) => {
          return {
            result: res?.data?.result,
            expr: target.expr,
          };
        });
    });
    Promise.all(promises).then((res) => {
      _.forEach(res, (item) => {
        const target = _.find(targets, (t) => t.expr === item.expr);
        _.forEach(item.result, (serie) => {
          _series.push({
            id: _.uniqueId('series_'),
            name: target?.legend ? replaceExpressionBracket(target?.legend, serie.metric) : getSerieName(serie.metric, item.expr),
            metric: {
              ...serie.metric,
              __name__: serie.metric.__name__ || item.expr,
            },
            expr: item.expr,
            data: serie.values,
          });
        });
      });
      setSeries(_series);
    });
  }, [JSON.stringify(_.map(targets, 'expr')), JSON.stringify(time), step]);

  useEffect(() => {
    const _series = _.map(series, (item) => {
      const target = _.find(targets, (t) => t.expr === item.expr);
      return {
        ...item,
        name: target?.legend ? replaceExpressionBracket(target?.legend, item.metric) : item.name,
      };
    });
    setSeries(_series);
  }, [JSON.stringify(_.map(targets, 'legend'))]);

  return { series };
}
