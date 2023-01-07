import React, { useState } from 'react';
import MetricSelect from './MetricSelect';
import LabelFilters from './LabelFilters';
import Operations from './Operations';
import RawQuery from './RawQuery';
import { PromVisualQuery } from './types';
import './style.less';

interface IProps {
  datasourceValue: string;
  params: {
    start: number;
    end: number;
  };
}

export default function index(props: IProps) {
  const { datasourceValue, params } = props;
  const [query, setQuery] = useState<PromVisualQuery>({
    labels: [
      {
        label: '',
        value: '',
        op: '=',
      },
    ] as any,
    operations: [] as any,
  } as PromVisualQuery);

  return (
    <div className='prom-query-builder-container'>
      <div className='prom-query-builder-metric-label-container'>
        <MetricSelect
          datasourceValue={datasourceValue}
          params={params}
          value={query.metric}
          onChange={(val) => {
            setQuery({
              ...query,
              metric: val,
            });
          }}
        />
        <LabelFilters
          datasourceValue={datasourceValue}
          metric={query.metric}
          params={params}
          value={query.labels}
          onChange={(val) => {
            setQuery({
              ...query,
              labels: val,
            });
          }}
        />
      </div>
      <Operations
        metric={query.metric}
        query={query}
        datasourceValue={datasourceValue}
        params={params}
        value={query.operations}
        onChange={(val) => {
          setQuery(val);
        }}
      />
      <RawQuery query={query} />
    </div>
  );
}
