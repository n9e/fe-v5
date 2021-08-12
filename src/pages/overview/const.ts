import { OverListItem, IndicatorEditItem } from '@/store/overview';
import { TFunction } from 'i18next';
export const overListDefaut = (t: TFunction): OverListItem[] => {
  return [
    {
      name: t('资源总量'),
      id: 'resource_total',
      num: 0,
      icon: 'icon-ziyuanzongliang',
      url: '/resource',
    },
    {
      name: t('策略总量'),
      id: 'alert_rule_total',
      num: 0,
      icon: 'icon-celvezongliang',
      url: '/strategy',
    },
    {
      name: t('大盘总量'),
      id: 'dashboard_total',
      num: 0,
      icon: 'icon-dapanzongliang',
      url: '/dashboard',
    },
    {
      name: t('用户总量'),
      id: 'user_total',
      num: 0,
      icon: 'icon-yonghuzongliang',
      url: '/manage/user',
    },
    {
      name: t('团队总量'),
      id: 'user_group_total',
      num: 0,
      icon: 'icon-tuanduizongliang',
      url: '/manage/group',
    },
  ];
};
export const indicatorKeysDefault: string[] = [
  'system_cpu_util',
  'system_mem_used_percent',
  'system_disk_used_percent',
  'system_io_util',
];

export const indicatorEditDefault: IndicatorEditItem[] = [
  {
    name: 'cpu使用率',
    promql: 'topk(20, max(system_cpu_util) by (ident))',
    warning: 50,
  },
  {
    name: '内存使用率',
    promql: 'topk(20, max(system_mem_used_percent) by (ident))',
    warning: 75,
  },
  {
    name: '磁盘使用率',
    promql: 'topk(20, max(system_disk_used_percent) by (ident))',
    warning: 75,
  },
  {
    name: 'io使用率',
    promql: 'topk(20, max(system_io_util) by (ident))',
    warning: 99,
  },
];
