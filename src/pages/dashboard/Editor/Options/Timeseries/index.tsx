import React from 'react';
import Tooltip from '../../Fields/Tooltip';
import Legend from '../../Fields/Legend';
import GraphStyles from './GraphStyles';
import StandardOptions from '../../Fields/StandardOptions';

export default function Timeseries() {
  return (
    <>
      <Tooltip />
      <Legend />
      <GraphStyles />
      <StandardOptions />
    </>
  );
}
