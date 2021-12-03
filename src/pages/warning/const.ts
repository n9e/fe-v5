export const funcMap = (t) => {
  return {
    all: {
      label: t('周期内所有点'),
      meaning: t(
        '在统计周期 $n 秒内（初次上报的指标，统计周期内只有一个值，如要限制点数，可选择happen函数）每个值都 $v',
      ),
      meaningEn: 'duration $n s, every value $v',
      params: [],
      defaultValue: [],
    },
    happen: {
      label: t('发生次数'),
      meaning: t('统计周期 $n 秒内至少有 $m 次值 $v'),
      meaningEn: 'duration $n s, $m times value $v',
      params: ['m'],
      defaultValue: [1],
    },
    max: {
      label: t('最大值'),
      meaning: t('统计周期 $n 秒内的最大值 $v'),
      meaningEn: 'duration $n s, max $v',
      params: [],
      defaultValue: [],
    },
    min: {
      label: t('最小值'),
      meaning: t('统计周期 $n 秒内的最小值 $v'),
      meaningEn: 'duration $n s, min $v',
      params: [],
      defaultValue: [],
    },
    avg: {
      label: t('均值'),
      meaning: t('统计周期 $n 秒内的均值 $v'),
      meaningEn: 'duration $n s, avg $v',
      params: [],
      defaultValue: [],
    },
    sum: {
      label: t('求和'),
      meaning: t('统计周期 $n 秒内的所有值求和 $v'),
      meaningEn: 'duration $n s, sum $v',
      params: [],
      defaultValue: [],
    },
    diff: {
      label: t('突增突降值'),
      meaning: t('最新值与其之前 $n 秒内的任意值之差 (区分正负) $v'),
      params: [],
      defaultValue: [],
    },
    pdiff: {
      label: t('突增突降率'),
      meaning: t(
        '(最新值与其之前 $n 秒的任意值之差)除以对应历史值 (区分正负) $v ％',
      ),
      params: [],
      defaultValue: [],
    },
    c_avg_rate_abs: {
      label: t('同比变化率'),
      meaning: t('最近 $n 秒平均值相对 $m 天前同周期平均值变化率 $v ％'),
      params: ['m'],
      defaultValue: [86400],
    },
    c_avg_rate: {
      label: t('同比变化率(区分正负)'),
      meaning: t('最近 $n 秒平均值相对 $m 天前同周期平均值变化率 $v ％'),
      params: ['m'],
      defaultValue: [86400],
    },
    c_avg_abs: {
      label: t('同比变化值'),
      meaning: t('最近 $n 秒平均值相对 $m 天前同周期平均值变化值 $v'),
      params: ['m'],
      defaultValue: [86400],
    },
    c_avg: {
      label: t('同比变化值(区分正负)'),
      meaning: t('最近 $n 秒平均值相对 $m 天前同周期平均值变化值 $v'),
      params: ['m'],
      defaultValue: [86400],
    },
    stddev: {
      label: t('3-sigma离群点检测'),
      meaning: t('统计周期 $n 秒内波动值过大，超过了 $m 个标准差范围'),
      meaningEn:
        'within $n seconds, the fluctuation value exceeds the $m standard deviation range',
      params: ['m'],
      defaultValue: [3],
    },
  };
};
export const resourceFilterConditions = [
  {
    value: 'InClasspath',
    multiple: true,
  },
  {
    value: 'NotInClasspath',
    multiple: true,
  },
  {
    value: 'InClasspathPrefix',
    multiple: false,
  },
  {
    value: 'NotInClasspathPrefix',
    multiple: false,
  },
  {
    value: 'InResourceList',
    multiple: true,
  },
  {
    value: 'NotInResourceList',
    multiple: true,
  },
  {
    value: 'HasPrefixString',
    multiple: false,
  },
  {
    value: 'NoPrefixString',
    multiple: false,
  },
  {
    value: 'HasSuffixString',
    multiple: false,
  },
  {
    value: 'NoSuffixString',
    multiple: false,
  },
  {
    value: 'ContainsString',
    multiple: false,
  },
  {
    value: 'NotContainsString',
    multiple: false,
  },
  {
    value: 'MatchRegexp',
    multiple: false,
  },
  {
    value: 'NotMatchRegexp',
    multiple: false,
  },
];
export const tagFilterConditions = [
  {
    value: 'InList',
    multiple: true,
  },
  {
    value: 'NotInList',
    multiple: true,
  },
  {
    value: 'HasPrefixString',
    multiple: false,
  },
  {
    value: 'NoPrefixString',
    multiple: false,
  },
  {
    value: 'HasSuffixString',
    multiple: false,
  },
  {
    value: 'NoSuffixString',
    multiple: false,
  },
  {
    value: 'ContainsString',
    multiple: false,
  },
  {
    value: 'NotContainsString',
    multiple: false,
  },
  {
    value: 'MatchRegexp',
    multiple: false,
  },
  {
    value: 'NotMatchRegexp',
    multiple: false,
  },
];

export const pageSizeOptionsDefault = ['30', '50', '100', '300'];

export const timeLensDefault = [
  {
    value: '1h'
  },
  {
    value: '2h'
  },
  {
    value: '3h'
  },
  {
    value: '6h'
  },
  {
    value: '12h'
  },
  {
    value: '1d'
  },
  {
    value: '2d'
  },
  {
    value: '3d'
  },
  {
    value: '5d'
  },
  {
    value: '7d'
  },
  {
    value: '14d'
  },
  {
    value: '30d'
  },
  {
    value: '60d'
  },
  {
    value: '90d'
  },
  {
    value: 'forever'
  }
]