import _ from 'lodash';
import moment from 'moment';
import { formatPickerDate } from '@/components/DateRangePicker';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { replaceExpressionVars } from '../../VariableConfig/constant';
import { fetchHistoryBatch } from '@/components/Graph/api';
import { ITarget } from '../../types';
import { IVariable } from '../../VariableConfig/definition';
import replaceExpressionBracket from '../utils/replaceExpressionBracket';
import { completeBreakpoints, getSerieName } from './utils';

interface IOptions {
  dashboardId: string;
  datasourceCate: string;
  datasourceName: string;
  id?: string;
  time: IRawTimeRange;
  step: number | null;
  targets: ITarget[];
  variableConfig?: IVariable[];
  spanNulls?: boolean;
}

const getDefaultStepByStartAndEnd = (start: number, end: number) => {
  return Math.max(Math.floor((end - start) / 240), 1);
};

export default async function prometheusQuery(options: IOptions) {
  const { dashboardId, id, time, step, targets, variableConfig, spanNulls } = options;
  if (!time.start) return;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let _step: any = step;
  if (!step) _step = getDefaultStepByStartAndEnd(start, end);
  const series: any[] = [];
  let batchParams: any[] = [];
  let exprs: string[] = [];
  let refIds: string[] = [];
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
        _step = getDefaultStepByStartAndEnd(start, end);
        if (target.step) {
          _step = target.step;
        }
      }

      start = start - (start % _step!);
      end = end - (end % _step!);

      const realExpr = variableConfig ? replaceExpressionVars(target.expr, variableConfig, variableConfig.length, dashboardId) : target.expr;
      if (realExpr) {
        batchParams.push({
          end: end,
          query: realExpr,
          start: start,
          step: _step,
        });
        exprs.push(target.expr);
        refIds.push(target.refId);
        signalKey += `-${target.expr}`;
      }
    });
    const res = await fetchHistoryBatch({ queries: batchParams }, signalKey);
    const dat = res.dat || [];
    for (let i = 0; i < dat?.length; i++) {
      var item = {
        result: dat[i],
        expr: exprs[i],
        refId: refIds[i],
      };
      const target = _.find(targets, (t) => t.expr === item.expr);
      _.forEach(item.result, (serie) => {
        series.push({
          id: _.uniqueId('series_'),
          refId: item.refId,
          name: target?.legend ? replaceExpressionBracket(target?.legend, serie.metric) : getSerieName(serie.metric),
          metric: serie.metric,
          expr: item.expr,
          data: !spanNulls ? completeBreakpoints(_step, serie.values) : serie.values,
        });
      });
    }
  }
  return series;
}
