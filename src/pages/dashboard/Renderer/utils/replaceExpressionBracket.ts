function extractBracketValue(str) {
  let reg = /{{([0-9a-zA-Z]+?)}}/g;
  let matchAll: any[] = Array.from(str.matchAll(reg));
  // https://javascript.info/regexp-methods#str-matchall-regexp
  return matchAll.map((item) => (item.length > 0 ? item[1] : item[0]));
}

export default function replaceExpressionBracket(titleFormat, serieMetricLabels) {
  let keys = extractBracketValue(titleFormat);
  var legendName = titleFormat;
  keys.forEach((key) => {
    legendName = legendName.replace(`{{${key}}}`, serieMetricLabels[key] ? serieMetricLabels[key] : '');
  });
  return legendName;
}