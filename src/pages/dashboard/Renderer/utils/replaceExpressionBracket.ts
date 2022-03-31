import _ from 'lodash';
function extractBracketValue(str) {
  let reg = /{{([\s0-9a-zA-Z_]+?)}}/g;
  let matchAll: any[] = Array.from(str.matchAll(reg));
  // https://javascript.info/regexp-methods#str-matchall-regexp
  return matchAll.map((item) => (item.length > 0 ? item[1] : item[0]));
}

export default function replaceExpressionBracket(titleFormat, serieMetricLabels) {
  let keys = _.map(extractBracketValue(titleFormat), _.trim);
  var legendName = titleFormat;
  keys.forEach((key) => {
    const reg = new RegExp(`{{\\s?${key}\\s?}}`, 'g');
    legendName = legendName.replace(reg, serieMetricLabels[key] ? serieMetricLabels[key] : '');
  });
  return legendName;
}