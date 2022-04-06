import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import * as api from '@/components/Graph/api';
import { Range, formatPickerDate } from '@/components/DateRangePicker';
import { ITarget } from '../../types';
import { VariableType } from '../../VariableConfig';
import { replaceExpressionVars } from '../../VariableConfig/constant';
import replaceExpressionBracket from '../utils/replaceExpressionBracket';
import { getVaraiableSelected } from '../../VariableConfig';

interface IProps {
  id?: string;
  dashboardId: string;
  time: Range;
  refreshFlag?: string;
  step: number | null;
  targets: ITarget[];
  variableConfig?: VariableType;
  inViewPort?: boolean;
}

const getSerieName = (metric: Object, expr: string) => {
  let name = metric['__name__'] || '';
  // if (_.keys(metric).length === 0) {
  //   name = expr;
  // }
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  return _.trim(name);
};

export default function usePrometheus(props: IProps) {
  const { id = 0, dashboardId, time, refreshFlag, step, targets, variableConfig, inViewPort } = props;
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const cachedVariableValues = _.map(variableConfig?.var, (item) => {
    return getVaraiableSelected(item.name, dashboardId);
  });
  const flag = useRef(false);
  const fetchData = () => {
    let { start, end } = formatPickerDate(time);
    let _step = step;
    if (!step) _step = Math.max(Math.floor((end - start) / 250), 1);
    const _series: any[] = [];
    const promises: Promise<any>[] = [];
    _.forEach(targets, (target, idx) => {
      if (target.time) {
        const { start: _start, end: _end } = formatPickerDate(target.time);
        start = _start;
        end = _end;
      }
      if (target.step) {
        _step = target.step;
      }
      const realExpr = variableConfig ? replaceExpressionVars(target.expr, variableConfig, variableConfig.var.length, dashboardId) : target.expr;
      const signalKey = `${id}-${idx}`;
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
              data: serie.values,
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
  }, [JSON.stringify(_.map(targets, 'expr')), JSON.stringify(time), refreshFlag, step, JSON.stringify(variableConfig), JSON.stringify(cachedVariableValues)]);

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
