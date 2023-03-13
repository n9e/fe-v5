import React from 'react';
import _ from 'lodash';

export default function ElasticsearchDetail(t) {
  const severityMap = [t('一级告警'), t('二级告警'), t('三级告警')];
  return [
    {
      label: t('数值提取'),
      key: 'queries',
      render(query) {
        return _.map(query, (item) => {
          return (
            <div key={item.ref}>
              <span className='pr16'>
                {t('名称')}: {item.ref}
              </span>
              <span className='pr16'>
                {t('索引')}: {item.index}
              </span>
              {item.query && (
                <span className='pr16'>
                  {t('查询条件')}: {item.query}
                </span>
              )}
              <span className='pr16'>
                {t('时间字段')}: {item.date_field}
              </span>
              <span className='pr16'>
                {t('间隔')}: {item.interval}
                {item.interval_unit}
              </span>
              <span className='pr16'>
                {t('函数')}: {item.value?.func}
              </span>
              {item.value?.func !== 'count' && (
                <span className='pr16'>
                  {t('字段名')}: {item.value?.field}
                </span>
              )}
              {_.map(item.group_by, (item) => {
                return (
                  <span className='pr16'>
                    {t('根据')} {item.field} {t('分组，匹配个数')} {item.size}, {t('文档最小值')} {item.min_value}
                  </span>
                );
              })}
            </div>
          );
        });
      },
    },
    {
      label: '告警条件',
      key: 'triggers',
      render(query) {
        return _.map(query, (item, idx) => {
          return (
            <div key={idx} style={{ backgroundColor: '#fafafa', padding: 8 }}>
              <span className='pr16'>{item.exp}</span>
              <span>触发 {severityMap[item.severity]}</span>
            </div>
          );
        });
      },
    },
  ];
}
