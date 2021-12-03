/* eslint-disable no-use-before-define */
import _ from 'lodash';
import moment from 'moment';
import { replaceExpressionBracket } from './index';
import { sizeFormatter } from '@/utils'
const fmt = 'YYYY-MM-DD HH:mm:ss';
import { ChartType } from '@/components/D3Charts/src/interface';

export default function getTooltipsContent(activeTooltipData) {
  const { points, series, formatUnit, precision, chartType } = activeTooltipData;
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
  const isSinglePoint = points.length === 1;
  _.each(points, (point, index) => {
    tooltipContent += renderPointContent(isSinglePoint, point, series[index], formatUnit, precision, chartType);
  });

  return `<div style="table-layout: fixed;max-width: ${tooltipWidth}px;word-wrap: break-word;white-space: normal;">${tooltipContent}</div>`;
}

function renderPointContent(isSingle, pointData = {}, serie = {}, formatUnit, precision, chartType) {
  const { legendTitleFormat } = serie;
  const { color, filledNull, serieOptions = {}, timestamp } = pointData;
  // StackArea 类型的原始值被存储在 y0key (值为 2) + 1 的位置，所以取了下标为 3 的值，后期可完善
  const value = chartType === ChartType.Line ? pointData.value : pointData[3];
  let comparison = '';
  if (serieOptions.comparison) {
    comparison += ` offset ${serieOptions.comparison}`;
  }

  const serieMetricLabels = serieOptions?.metricLabels || {};
  const metricName = serieMetricLabels.__name__ || '';
  const labelKeys = Object.keys(serieMetricLabels).filter((ml) => ml !== '__name__');

  const renderMultiSeriesPointContent = () => {
    const labelContents = labelKeys.map((label) => `<span>${label}=${serieMetricLabels[label]}</span>`);
    const label = legendTitleFormat ? replaceExpressionBracket(legendTitleFormat, serieMetricLabels) : `${metricName} ${comparison} {${labelContents}}`;
    return `<span style="color:${color}">● </span>
      ${label}：<strong>${formatValue(value)}${filledNull ? '(空值填补,仅限看图使用)' : ''}</strong>
      <br/>`;
  };

  const formatValue = value => {
    if (precision === 'short') {
      if (formatUnit === 1024 || formatUnit === 1000) {
        return value > 1000 ? sizeFormatter(value, 2, { convertNum: formatUnit }) : value.toFixed(2)
      } else if (formatUnit === 'humantime') {
        return moment.duration(value, 'seconds').humanize()
      } else {
        return ''
      }
    } else {
      return value
    }
  }

  const renderSingleSeriesPointContent = () => {
    const labelContents = labelKeys.map((label) => `<div><strong>${label}</strong>: ${serieMetricLabels[label]}</div>`);
    const label = legendTitleFormat ? replaceExpressionBracket(legendTitleFormat, serieMetricLabels) : `${metricName} ${comparison}${metricName || comparison ? ': ' : ''}`;
    return `<span style="color:${color}">● </span>
      ${label}<strong>${formatValue(value)}${
      filledNull ? '(空值填补,仅限看图使用)' : ''
    }</strong>
      <div /><br />
      <div><strong>Series:</strong></div>
      ${metricName ? `<div><strong>${metricName}</strong></div>` : ''}
      ${labelContents.join('')}`;
  };

  return isSingle ? renderSingleSeriesPointContent() : renderMultiSeriesPointContent();
}

function getHeaderStr(activeTooltipData) {
  const { points } = activeTooltipData;
  const dateStr = moment(points[0].timestamp).format(fmt);
  const headerStr = `<span style="color: #666">${dateStr}</span><br/>`;
  return headerStr;
}
