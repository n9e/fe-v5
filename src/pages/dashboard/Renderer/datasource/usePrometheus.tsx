import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import * as api from '@/components/Graph/api';
import { Range, formatPickerDate } from '@/components/DateRangePicker';
import { ITarget } from '../../types';
import { VariableType } from '../../VariableConfig';
import { replaceExpressionVars } from '../../VariableConfig/constant';

interface IProps {
  time: Range;
  step: number | null;
  targets: ITarget[];
  variableConfig?: VariableType;
}

const getSerieName = (metric: Object) => {
  let name = metric['__name__'];
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
    const exprs = _.map(targets, 'expr');
    const promises = _.map(exprs, (expr) => {
      const realExpr = variableConfig ? replaceExpressionVars(expr, variableConfig, variableConfig.var.length) : expr;
      return api
        .fetchHistory({
          start,
          end,
          step: _step,
          query: realExpr,
        })
        .then((res) => {
          return res?.data?.result;
        });
    });
    Promise.all(promises).then((res) => {
      _.forEach(res, (item) => {
        _.forEach(item, (serie) => {
          _series.push({
            name: getSerieName(serie.metric),
            metric: serie.metric,
            data: serie.values,
          });
        });
      });
      setSeries(_series);
    });
  }, [JSON.stringify(targets), JSON.stringify(time), step]);

  return { series };
}
