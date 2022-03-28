import React from 'react';
import _ from 'lodash';
import Timeseries from './Timeseries';
import Stat from './Stat';
import Table from './Table';
import Pie from './Pie';

export default function index({ type, targets }) {
  const OptionsCptMap = {
    timeseries: <Timeseries />,
    stat: <Stat />,
    table: <Table targets={targets} />,
    pie: <Pie />,
  };
  return OptionsCptMap[type] || `无效的图表类型 ${type}`;
}
