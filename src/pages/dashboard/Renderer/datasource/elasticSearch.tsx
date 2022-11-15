import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDsQuery, getLogQuery } from '@/services/warning';
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

/**
 * 根据 target 判断是否为查询 raw data
 */
function isRawDataQuery(target: ITarget) {
  if (_.size(target.query?.values) === 1) {
    const func = _.get(target, ['query', 'values', 0, 'func']);
    return func === 'rawData';
  }
  return false;
}

export default async function elasticSearchQuery(options: IOptions) {
  const { dashboardId, time, targets, datasourceCate, datasourceName, variableConfig } = options;
  if (!time.start) return;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchDsParams: any[] = [];
  let batchLogParams: any[] = [];
  let series: any[] = [];
  if (targets && datasourceName) {
    _.forEach(targets, (target) => {
      const query = target.query || {};
      _.forEach(query?.values, (value) => {
        const filter = variableConfig ? replaceExpressionVars(query.filter, variableConfig, variableConfig.length, dashboardId) : query.filter;
        if (isRawDataQuery(target)) {
          batchLogParams.push({
            index: query.index,
            filter,
            date_field: query.date_field,
            limit: query.limit,
            start,
            end,
          });
        } else {
          batchDsParams.push({
            index: query.index,
            filter,
            value,
            group_by: query.group_by,
            date_field: query.date_field,
            interval: normalizeTime(query.interval, query.interval_unit),
            start,
            end,
          });
        }
      });
    });
    if (!_.isEmpty(batchDsParams)) {
      const res = await getDsQuery({
        cate: datasourceCate,
        cluster: datasourceName,
        query: batchDsParams,
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
    if (!_.isEmpty(batchLogParams)) {
      const res = await getLogQuery({
        cate: datasourceCate,
        cluster: datasourceName,
        query: batchLogParams,
      });
      series = _.concat(
        series,
        _.map(res.dat, (item) => {
          return {
            id: item._id,
            name: item._index,
            metric: item.fields,
            data: [],
          };
        }),
      );
    }
  }
  return series;
}
