import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getLogQuery } from '@/services/warning';
import { normalizeTime } from '@/pages/warning/strategy/components/utils';
import { ITarget } from '../../types';
import { getSerieName } from './utils';

interface IOptions {
  dashboardId: string;
  datasourceCate: string;
  datasourceName: string;
  id?: string;
  time: IRawTimeRange;
  targets: ITarget[];
}

export default async function elasticSearchLogQuery(options: IOptions) {
  const { dashboardId, id, time, targets, datasourceCate, datasourceName } = options;
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
        batchParams.push({
          index: query.index,
          filter: query.filter,
          value,
          group_by: query.group_by,
          date_field: query.date_field,
          interval: normalizeTime(query.interval, query.interval_unit),
          start,
          end,
        });
      });
    });
    const res = await getLogQuery({
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
