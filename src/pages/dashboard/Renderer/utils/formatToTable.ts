import _ from 'lodash';

const formatToTable = (series: any[], rowBy: string, colBy: string) => {
  const rows = _.groupBy(series, (item) => {
    return item.fields[rowBy];
  });
  const newSeries = _.map(rows, (val, key) => {
    const item: any = {
      [rowBy]: key,
    };
    const subGrouped = _.groupBy(val, (item) => {
      return item.fields[colBy];
    });
    _.forEach(subGrouped, (subVal, subKey) => {
      item[subKey] = {
        name: subVal[0].name,
        id: subVal[0].id,
        stat: subVal[0].stat,
        color: subVal[0].color,
        text: subVal[0].text,
      };
    });
    item.groupNames = _.keys(subGrouped);
    return item;
  });
  return newSeries;
}

export default formatToTable;