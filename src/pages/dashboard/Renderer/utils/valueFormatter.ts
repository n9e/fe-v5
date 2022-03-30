import _ from 'lodash';
import moment from 'moment';
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
    if (util === 'none') {
      return _.round(val, decimals);
    }
    if (util === 'percent') {
      return _.round(val, decimals) + '%';
    }
    if (util === 'percentUnit') {
      return _.round(val * 100, decimals) + '%';
    }
    if (util === 'humantimeSeconds') {
      return moment.duration(val, 'seconds').humanize();
    }
    if (util === 'humantimeMilliseconds') {
      return moment.duration(val, 'milliseconds').humanize();
    }
    return _.round(val, decimals);
  }
  // 默认返回 SI 不带基础单位
  return byteConverter.format(val, {
    type: 'si',
    decimals,
  });
};
export default valueFormatter;