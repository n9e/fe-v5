import _ from 'lodash';
import { getDsQuery } from '@/services/warning';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import { normalizeTime } from '@/pages/warning/strategy/components/utils';

interface IOptions {
  datasourceCate: string;
  datasourceName: string;
  query: any;
  start: number;
  end: number;
  interval: number;
  intervalUnit: 'second' | 'min' | 'hour';
}

export default async function metricQuery(options: IOptions) {
  const { query, datasourceCate, datasourceName, start, end, interval, intervalUnit } = options;
  let series: any[] = [];
  const res = await getDsQuery({
    cate: datasourceCate,
    cluster: datasourceName,
    query: [
      {
        index: query.index,
        filter: query.filter,
        date_field: query.date_field,
        interval: normalizeTime(interval, intervalUnit),
        value: {
          func: 'count',
        },
        start: start, // 1660735739
        end: end, // 1660736039
      },
    ],
  });
  series = _.map(res.dat, (item) => {
    return {
      id: _.uniqueId('series_'),
      name: getSerieName(item.metric),
      metric: item.metric,
      data: item.values,
    };
  });
  return series;
}
