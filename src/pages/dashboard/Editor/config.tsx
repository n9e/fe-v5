export const visualizations = [
  {
    type: 'timeseries',
    name: '时间序列图',
  },
  {
    type: 'stat',
    name: '指标值',
  },
  {
    type: 'table',
    name: '表格',
  },
  {
    type: 'pie',
    name: '饼图',
  },
];

export const IRefreshMap = {
  off: 'off',
  '5s': 5,
  '10s': 10,
  '30s': 30,
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '2h': 7200,
  '1d': 86400,
};

export const defaultValues = {
  version: '1.0.0',
  type: 'timeseries',
  options: {
    tooltip: {
      mode: 'all',
      sort: 'none',
    },
    legend: {
      displayMode: 'hidden',
    },
  },
  custom: {
    drawStyle: 'lines',
    lineInterpolation: 'smooth',
    fillOpacity: 0.5,
    stack: 'off',
  },
};
