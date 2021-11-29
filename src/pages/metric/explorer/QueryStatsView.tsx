import React, { FC } from 'react';

export interface QueryStats {
  loadTime: number;
  resolution?: number;
  resultSeries: number;
}

const QueryStatsView: FC<QueryStats> = (props) => {
  const { loadTime, resolution, resultSeries } = props;

  return (
    <div className="query-stats">
      <span>
        Load time: {loadTime}ms &ensp;{resolution && `Resolution: ${resolution}s `}&ensp;Result series: {resultSeries}
      </span>
    </div>
  );
};

export default QueryStatsView;
