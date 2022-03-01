import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import * as api from '@/components/Graph/api';
import { Range, formatPickerDate } from '@/components/DateRangePicker';

interface IProps {
  time: Range;
  step: number | null;
  query: string;
}

export default function usePrometheus(props: IProps) {
  const { time, step, query } = props;
  const { start, end } = formatPickerDate(time);
  const [series, setSeries] = useState<any[]>([]);
  let _step = step;
  if (!step) _step = Math.max(Math.floor((end - start) / 250), 1);
  useEffect(() => {
    const _series: any[] = [];
    const promises = _.map(query, (item) => {
      return api
        .fetchHistory({
          start,
          end,
          step: _step,
          query: item.PromQL,
        })
        .then((res) => {
          return res?.data?.result;
        });
    });
    Promise.all(promises).then((res) => {
      _.forEach(res, (item) => {
        _.forEach(item, (serie) => {
          _series.push({
            name: serie.metric.instance, // TODO: 临时定义曲线名称，需要结合真实情况处理
            data: _.map(serie.values, (item) => {
              return [item[0], _.toNumber(item[1])]; // TODO: 需要在 ts-graph 里面处理下 bignumber
            }),
          });
        });
      });
      setSeries(_series);
    });
  }, [JSON.stringify(query)]);

  return { series };
}
