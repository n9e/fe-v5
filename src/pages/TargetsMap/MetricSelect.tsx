import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import { Range } from '@/components/DateRangePicker';
import { getMetricValues, getQueryRangeSingleMetric } from '@/services/metricViews';
import { targetsToMatch } from './utils';

interface IProps {
  range: Range;
  idents: string[];
  calc: string;
  onChange: (series: any[]) => void;
}

export default function MetricSelect(props: IProps) {
  const { range, idents, calc, onChange } = props;
  const [metrics, setMetrics] = useState([]);
  const [metric, setMetric] = useState<string>();
  const matchStr = targetsToMatch(idents);

  useEffect(() => {
    if (idents.length) {
      getMetricValues(matchStr, range).then((res) => {
        const _metrics = _.union(res);
        setMetrics(_metrics);
      });
    }
  }, [JSON.stringify(range), matchStr]);

  useEffect(() => {
    if (metric && idents.length) {
      getQueryRangeSingleMetric({
        metric,
        match: matchStr,
        range,
        calcFunc: calc,
      }).then((res) => {
        onChange(
          _.map(res.data.result, (item) => {
            return {
              name: item.metric.ident,
              metric: item.metric,
              data: item.values,
            };
          }),
        );
      });
    }
  }, [JSON.stringify(range), matchStr, metric, calc]);

  return (
    <Select
      style={{ width: 200 }}
      placement='bottomRight'
      showSearch
      placeholder='指标'
      value={metric}
      onChange={(e: string) => {
        setMetric(e);
      }}
    >
      {_.map(metrics, (item) => {
        return (
          <Select.Option key={item} value={item}>
            {item}
          </Select.Option>
        );
      })}
    </Select>
  );
}
