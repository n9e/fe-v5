import React, { useRef, useState, useEffect } from 'react';
import _ from 'lodash';
import * as api from '@/components/Graph/api';
import { Range, formatPickerDate } from '@/components/DateRangePicker';
import { ITarget } from '../../types';

interface IProps {
  time: Range;
  step: number | null;
  targets: ITarget[];
}

export default function usePrometheus(props: IProps) {
  const { time, step, targets } = props;
  const { start, end } = formatPickerDate(time);
  const [series, setSeries] = useState<any[]>([]);
  let _step = step;
  if (!step) _step = Math.max(Math.floor((end - start) / 250), 1);
  useEffect(() => {
    const _series: any[] = [];
    const promises = _.map(targets, (item: ITarget) => {
      return api
        .fetchHistory({
          start,
          end,
          step: _step,
          query: item?.expr,
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
            data: serie.values,
          });
        });
      });
      setSeries(_series);
    });
  }, [JSON.stringify(targets), start, end, _step]);

  return { series };
}
