import normalizeSeries from './normalizeSeries';
import getTooltipsContent from './getTooltipsContent';
import getTimeLabelVal from './getTimeLabelVal';
import isEqualBy from './isEqualBy';
import getYAxis from './getYAxis';

function extractBracketValue(str) {
  let reg = /{{([0-9a-zA-Z]+?)}}/g;
  let matchAll = Array.from(str.matchAll(reg));
  // https://javascript.info/regexp-methods#str-matchall-regexp
  return matchAll.map((item) => (item.length > 0 ? item[1] : item[0]));
}

function replaceExpressionBracket(titleFormat, serieMetricLabels) {
  let keys = extractBracketValue(titleFormat);
  var legendName = titleFormat;
  keys.forEach((key) => {
    legendName = legendName.replace(`{{${key}}}`, serieMetricLabels[key] ? serieMetricLabels[key] : '');
  });
  return legendName;
}

export { normalizeSeries, getTooltipsContent, getTimeLabelVal, isEqualBy, getYAxis, replaceExpressionBracket };
