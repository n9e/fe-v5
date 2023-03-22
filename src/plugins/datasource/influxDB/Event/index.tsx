import React from 'react';
import _ from 'lodash';

export default function index(t) {
  const severityMap = {
    1: t('一级告警'),
    2: t('二级告警'),
    3: t('三级告警'),
  };
  return [
    {
      label: t('数据源'),
      key: 'queries',
      render(val) {
        return _.get(val, '[0].dbname');
      },
    },
    {
      label: t('查询条件'),
      key: 'queries',
      render(val) {
        return `${_.get(val, '[0].ref')}: ${_.get(val, '[0].command')}`;
      },
    },
    {
      label: t('告警条件'),
      key: 'triggers',
      render(val) {
        const trigger = _.get(val, '[0]');
        return `${trigger?.exp} ${t('触发')} ${severityMap[trigger?.severity]}`;
      },
    },
  ];
}
