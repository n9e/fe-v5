import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import _ from 'lodash';
import PromGraph from '@/components/PromGraphCpt';
import { IRawTimeRange, timeRangeUnix } from '@/components/TimeRangePicker';

type IMode = 'table' | 'graph';

export default function Prometheus({ defaultPromQL }: { defaultPromQL: string }) {
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search);

  let defaultTime: undefined | IRawTimeRange;

  if (query.start && query.end) {
    defaultTime = {
      start: moment.unix(_.toNumber(query.start)),
      end: moment.unix(_.toNumber(query.end)),
    };
  }

  return (
    <PromGraph
      url='/api/n9e/prometheus'
      type={query.mode as IMode}
      onTypeChange={(newType) => {
        history.replace({
          pathname: '/metric/explorer',
          search: queryString.stringify({ ...query, mode: newType }),
        });
      }}
      defaultTime={defaultTime}
      onTimeChange={(newRange) => {
        history.replace({
          pathname: '/metric/explorer',
          search: queryString.stringify({ ...query, ...timeRangeUnix(newRange) }),
        });
      }}
      promQL={defaultPromQL}
      datasourceIdRequired={false}
      graphOperates={{ enabled: true }}
      globalOperates={{ enabled: true }}
    />
  );
}
