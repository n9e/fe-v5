import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { ITarget } from '@/pages/dashboard/types';
import { getSerieName } from '../../../utils';
import { getInfluxdbQuery } from '../services';
import { InfluxDBQueryParams } from '../types';

interface IOptions {
  dashboardId: string;
  datasourceCate: string;
  datasourceName: string;
  id?: string;
  time: IRawTimeRange;
  targets: ITarget[];
}

export default async function influxdbDatasource(options: IOptions) {
  const { time, targets, datasourceCate, datasourceName } = options;
  if (!time.start) return;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchTimeSeriesParams: InfluxDBQueryParams['query'] = [];
  let series: any[] = [];
  if (targets && datasourceName) {
    _.forEach(targets, (target) => {
      const query = target.query || {};
      if (query.dbname && query.command) {
        batchTimeSeriesParams.push({
          dbname: query.dbname,
          command: query.command,
          start,
          end,
        });
      }
    });
    if (_.isEmpty(batchTimeSeriesParams)) return [];
    const seriesRes = await getInfluxdbQuery({
      cate: datasourceCate,
      cluster: datasourceName,
      query: batchTimeSeriesParams,
    });
    series = _.map(seriesRes, (item) => {
      return {
        id: _.uniqueId('series_'),
        name: getSerieName(item.metric),
        metric: item.metric,
        data: item.values,
      };
    });
    return series;
  }
  return series;
}
