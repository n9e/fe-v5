import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDsQuery } from '@/services/warning';
import { normalizeTime } from '@/pages/warning/strategy/components/utils';
import { ITarget } from '../../types';
import { getSerieName } from './utils';
import { IVariable } from '../../VariableConfig/definition';
import { replaceExpressionVars } from '../../VariableConfig/constant';

interface IOptions {
  dashboardId: string;
  datasourceCate: string;
  datasourceName: string;
  id?: string;
  time: IRawTimeRange;
  targets: ITarget[];
  variableConfig?: IVariable[];
}

export default async function elasticSearchQuery(options: IOptions) {
  const { dashboardId, id, time, targets, datasourceCate, datasourceName, variableConfig } = options;
  if (!time.start) return;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchParams: any[] = [];
  let series: any[] = [];
  if (targets && datasourceName) {
    _.forEach(targets, (target) => {
      const query = target.query || {};
      _.forEach(query?.values, (value) => {
        const filter = variableConfig ? replaceExpressionVars(query.filter, variableConfig, variableConfig.length, dashboardId) : query.filter;
        batchParams.push({
          index: query.index,
          filter,
          value,
          group_by: query.group_by,
          date_field: query.date_field,
          interval: normalizeTime(query.interval, query.interval_unit),
          start,
          end,
        });
      });
    });
    const res = await getDsQuery({
      cate: datasourceCate,
      cluster: datasourceName,
      query: batchParams,
    });
    series = _.map(res.dat, (item) => {
      return {
        id: _.uniqueId('series_'),
        name: getSerieName(item.metric),
        metric: item.metric,
        data: item.values,
      };
    });
  }
  return series;
}
