import _ from 'lodash';

export default function isEqualBy(value, other, keyName) {
  return _.isEqualWith(value, other, (objValue, othValue, index) => {
    if (index === undefined) return undefined;
    return _.isEqual(objValue[keyName], othValue[keyName]);
  });
}
