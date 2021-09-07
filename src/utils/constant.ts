export const PAGE_SIZE = 15;
export const PAGE_SIZE_MAX = 100000;
export const PAGE_SIZE_OPTION = 20;
export const PAGE_SIZE_OPTION_LARGE = 150;

export const randomColor = [
  'pink',
  'red',
  'yellow',
  'orange',
  'cyan',
  'green',
  'blue',
  'purple',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime',
];

export const priorityColor = ['red', 'orange', 'blue'];
// 主题色
export const chartColor = [
  '#c23531',
  '#2f4554',
  '#61a0a8',
  '#d48265',
  '#91c7ae',
  '#749f83',
  '#ca8622',
  '#bda29a',
  '#6e7074',
  '#546570',
  '#c4ccd3',
];

export const chartDefaultOptions = {
  color: chartColor,
  xAxis: { data: [] },
  yAxis: {},
  series: [],
  tooltip: {
    show: true,
    trigger: 'axis',
    textStyle: {
      fontSize: 12,
      lineHeight: 12,
    },
  },
  grid: {
    left: '2%',
    right: '1%',
    top: '20',
    bottom: '20',
  },
  legend: {
    lineStyle: {
      width: 1,
    },
  },
  animation: false,
};
