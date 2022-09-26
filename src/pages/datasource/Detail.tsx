import React from 'react';
import TimeSeriesForm from './TimeSeriesSource/Detail';
import LogForm from './LogSource/Detail';

interface IProps {
  data: any;
  visible: boolean;
  onClose: () => void;
}

export default function Detail(props: IProps) {
  const { data, visible, onClose } = props;
  if (data.category === 'timeseries') {
    return <TimeSeriesForm data={data} visible={visible} onClose={onClose} />;
  }
  if (data.category === 'logging') {
    return <LogForm data={data} visible={visible} onClose={onClose} />;
  }
  return null;
}
