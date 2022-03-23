import React from 'react';
import GraphStyles from './GraphStyles';
import StandardOptions from '../../Fields/StandardOptions';
import ValueMappings from '../../Fields/ValueMappings';
import Overrides from '../../Fields/Overrides';

export default function Timeseries() {
  return (
    <>
      <GraphStyles />
      <ValueMappings />
      <StandardOptions />
      <Overrides />
    </>
  );
}
