import React from 'react';
import Tooltip from '../../Fields/Tooltip';
import Legend from '../../Fields/Legend';
import GraphStyles from './GraphStyles';
import StandardOptions from '../../Fields/StandardOptions';
import Thresholds from '../../Fields/Thresholds';

export default function Timeseries() {
  return (
    <>
      <Tooltip />
      <Legend />
      <GraphStyles />
      <StandardOptions />
      <Thresholds />
    </>
  );
}
