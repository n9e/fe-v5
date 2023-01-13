import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import moment from 'moment';
import _ from 'lodash';
import PromGraph from '@/components/PromGraphCpt';
import { IRawTimeRange, timeRangeUnix, isMathString } from '@/components/TimeRangePicker';

type IMode = 'table' | 'graph';
interface IProps {
  defaultPromQL: string;
  headerExtra: HTMLDivElement | null;
}

export default function Prometheus(props: IProps) {
  const { defaultPromQL, headerExtra } = props;
  const history = useHistory();
  const { search } = useLocation();
  const query = queryString.parse(search);

  let defaultTime: undefined | IRawTimeRange;

  if (typeof query.start === 'string' && typeof query.end === 'string') {
    defaultTime = {
      start: isMathString(query.start) ? query.start : moment.unix(_.toNumber(query.start)),
      end: isMathString(query.end) ? query.end : moment.unix(_.toNumber(query.end)),
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
        let { start, end } = newRange;
        if (moment.isMoment(start) && moment.isMoment(end)) {
          const parsedRange = timeRangeUnix(newRange);
          start = parsedRange.start as any;
          end = parsedRange.end as any;
        }
        history.replace({
          pathname: '/metric/explorer',
          search: queryString.stringify({ ...query, start, end }),
        });
      }}
      promQL={defaultPromQL}
      datasourceIdRequired={false}
      graphOperates={{ enabled: true }}
      globalOperates={{ enabled: true }}
      headerExtra={headerExtra}
    />
  );
}
