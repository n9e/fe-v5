import React from 'react';
import _ from 'lodash';

const severityMap = {
  1: '一级告警',
  2: '二级告警',
  3: '三级告警',
};

export default function AliyunSLSDetail() {
  return [
    {
      label: '项目',
      key: 'queries',
      render(val) {
        return _.get(val, '[0].project');
      },
    },
    {
      label: '日志库',
      key: 'queries',
      render(val) {
        return _.get(val, '[0].logstore');
      },
    },
    {
      label: '查询条件',
      key: 'queries',
      render(val) {
        return _.get(val, '[0].query');
      },
    },
    {
      label: '告警条件',
      key: 'triggers',
      render(val) {
        const trigger = _.get(val, '[0]');
        return `${trigger?.exp} 触发 ${severityMap[trigger?.severity]}`;
      },
    },
  ];
}
