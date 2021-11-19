/* eslint-disable no-use-before-define */
import _ from 'lodash';
import moment from 'moment';

const fmt = 'YYYY-MM-DD HH:mm:ss';

export default function getTooltipsContent(activeTooltipData) {
  const { points, series, formatUnit, precision } = activeTooltipData;
  const tooltipWidth = window.innerWidth / 1.5;
  // const sortedPoints = _.orderBy(points, (point) => {
  //   const { series = {} } = point;
  //   if (isComparison) {
  //     const { comparison } = series.userOptions || {};
  //     return Number(comparison) || 0;
  //   }
  //   return _.get(point, 'tags');
  // });
  let tooltipContent = '';

  tooltipContent += getHeaderStr(activeTooltipData);

  _.each(points, (point, index) => {
    tooltipContent += singlePoint(point, series[index], formatUnit, precision);
  });

  return `<div style="table-layout: fixed;max-width: ${tooltipWidth}px;word-wrap: break-word;white-space: normal;">${tooltipContent}</div>`;
}

function singlePoint(pointData = {}, serie = {}, formatUnit, precision) {
  const { color, filledNull, serieOptions = {}, timestamp } = pointData;
  const { tags } = serieOptions;
  const value = pointData.value;
  let name = tags;
  if (serie.comparison) {
    name += ` offset ${serie.comparison}`
  }

  const serieMetricLabels = serie?.metricLabels || {}
  const labels = Object.keys(serieMetricLabels).map(label => `<span>${label}=${serieMetricLabels[label]}</span>`)

  return (
    `<span style="color:${color}">● </span>
    【${name}】${labels}：<strong>${value > 1000 ? sizeFormatter(value) : value.toFixed(2)}${filledNull ? '(空值填补,仅限看图使用)' : ''}</strong>
    <br/>`
  );
}

function getHeaderStr(activeTooltipData) {
  const { points } = activeTooltipData;
  const dateStr = moment(points[0].timestamp).format(fmt);
  const headerStr = `<span style="color: #666">${dateStr}</span><br/>`;
  return headerStr;
}

function sizeFormatter (val, fixedCount = 2, {
  withUnit = true,
  withByte = true,
  trimZero = false,
} = {
  withUnit: true,
  withByte: true,
  trimZero: false
}) {
  const size = val ? Number(val) : 0
  let result
  let unit = ''

  if (size < 0) {
    result = 0
  } else if (size < 1024) {
    result = size.toFixed(fixedCount)
  } else if (size < 1024 * 1024) {
    result = (size / 1024).toFixed(fixedCount)
    unit = 'K'
  } else if (size < 1024 * 1024 * 1024) {
    result = (size / 1024 / 1024).toFixed(fixedCount)
    unit = 'M'
  } else if (size < 1024 * 1024 * 1024 * 1024) {
    result = (size / 1024 / 1024 / 1024).toFixed(fixedCount)
    unit = 'G'
  } else if (size < 1024 * 1024 * 1024 * 1024 * 1024) {
    result = (size / 1024 / 1024 / 1024 / 1024).toFixed(fixedCount)
    unit = 'T'
  }

  trimZero && (result = parseFloat(result))
  withUnit && (result = `${result}${unit}`)
  withByte && (result = `${result}B`)
  return result
}
