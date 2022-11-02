import _ from 'lodash';
import moment from 'moment';
import { parseRange } from '@/components/TimeRangePicker';
import { getDsQuery } from '@/services/warning';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';

interface IOptions {
  datasourceCate: string;
  datasourceName: string;
  query: any;
}

export default async function metricQuery(options: IOptions) {
  const { query, datasourceCate, datasourceName } = options;
  const { range } = query;
  if (!range.start) return;
  const parsedRange = parseRange(range);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let series: any[] = [];
  const res = await getDsQuery({
    cate: datasourceCate,
    cluster: datasourceName,
    query: [
      {
        index: query.index,
        filter: query.filter,
        date_field: query.date_field,
        interval: 10, // TODO: 需要把设置暴露出来吗？
        value: {
          func: 'count',
        },
        start: 1660735739,
        end: 1660736039,
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
