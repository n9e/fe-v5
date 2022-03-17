import _ from 'lodash';
import { utilValMap } from '../config';
import * as byteConverter from './byteConverter';

const valueFormatter = ({util, decimals = 3}, val) => {
  if (util) {
    const utilValObj = utilValMap[util];
    if (utilValObj) {
      const { type, base } = utilValObj;
      return byteConverter.format(val, {
        type,
        base,
        decimals,
      });
    }
    if (util === 'percent') {
      return _.round(val, decimals) + '%';
    }
    if (util === 'percentUnit') {
      return _.round(val * 100, decimals) + '%';
    }
    return val;
  }
  return _.round(val, decimals);
};
export default valueFormatter;