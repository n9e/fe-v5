// wiki: https://en.wikipedia.org/wiki/Byte#Multiple-byte_units
import _ from 'lodash';

interface IOptions {
  type: 'si' | 'iec';
  base: 'bits' | 'bytes';
  decimals: number;
}

const defaultOptions: IOptions = {
  type: 'iec',
  base: 'bytes',
  decimals: 2,
};

const valueMap = [
  { exp: 0, si: '', iec: '', iecExp: 1 },
  { exp: 3, si: 'k', iec: 'Ki', iecExp: 10 },
  { exp: 6, si: 'M', iec: 'Mi', iecExp: 20 },
  { exp: 9, si: 'G', iec: 'Gi', iecExp: 30 },
  { exp: 12, si: 'T', iec: 'Ti', iecExp: 40 },
  { exp: 15, si: 'P', iec: 'Pi', iecExp: 50 },
  { exp: 18, si: 'E', iec: 'Ei', iecExp: 60 },
  { exp: 21, si: 'Z', iec: 'Zi', iecExp: 70 },
  { exp: 24, si: 'Y', iec: 'Yi', iecExp: 80 }
];

const baseUtilMap = {
  bits: 'b',
  bytes: 'B',
};

export const config = [
  {
    name: 'Data(SI)',
    type: 'si',
    children: [{
      name: 'bits',
    }, {
      name: 'bytes',
    }]
  }, {
    name: 'Data(IEC)',
    type: 'iec',
    children: [{
      name: 'bits',
    }, {
      name: 'bytes',
    }]
  }
];

export function format(value: number, options = defaultOptions) {
  const baseNum = options.type === 'iec' ? 2 : 10;
  const baseUtil = baseUtilMap[options.base];
  const autoDetectRegex = /(\d.*\+)(\d{1,2})/;
  const autoDetect = value.toExponential();
  const expArray = autoDetect.match(autoDetectRegex);
  const expVal = Math.floor(parseInt(_.get(expArray, '[2]')) / 3) * 3;
  const map = _.find(valueMap, { exp: expVal });

  if (!map) {
    return 'unitInvalid';
  }

  const unit = _.get(map, options.type);
  const exp = _.get(map, options.type === 'iec' ? 'iecExp' : 'exp');
  const divider = Math.pow(baseNum, exp);
  const newValue = _.round(value / divider, options.decimals);

  return newValue + unit + baseUtil;
}

export function parse(value: string, options = defaultOptions) {

}