import _ from 'lodash';
import * as config from '../config';

export default function getTimeLabelVal(start, end, key) {
  const interval = end - start;
  const currentTime = _.find(config.time, { value: _.toString(interval) });
  if (currentTime) {
    return currentTime[key];
  }
  return key === 'label' ? '其它' : 'custom';
}
