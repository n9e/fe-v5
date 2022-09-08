import React from 'react';
import { useParams } from 'react-router-dom';
import TimeSeriesForm from './TimeSeriesSource/Form';
import LogForm from './LogSource/Form';

export default function Form() {
  const params = useParams<{ cate: string; action: string; type: string }>();
  if (params.cate === 'timeseries') {
    return <TimeSeriesForm />;
  }
  if (params.cate === 'logging') {
    return <LogForm />;
  }
  return null;
}
