import _ from 'lodash';
import { PromVisualQuery } from '../types';

export const normalizeDefaultValue = (value: PromVisualQuery) => {
  const valueClone = _.cloneDeep(value);
  if (valueClone.labels.length === 0) {
    valueClone.labels.push({
      label: '',
      value: '',
      op: '=',
    });
  }
  return valueClone;
};
