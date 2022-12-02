import React from 'react';
import _ from 'lodash';
import { severityMap } from '@/pages/warning/strategy/components/ElasticsearchSettings/Rules';

export default function ElasticsearchDetail() {
  return [
    {
      label: '索引',
      key: 'query',
      render(query) {
        return query?.index;
      },
    },
    {
      label: '过滤项',
      key: 'query',
      render(query) {
        return query?.filter || '无';
      },
    },
    {
      label: '数值提取',
      key: 'query',
      render(query) {
        return _.map(query?.values, (item) => {
          return (
            <div key={item.ref}>
              <span className='pr16'>名称: {item.ref}</span>
              <span className='pr16'>函数: {item.func}</span>
              {item.func !== 'count' && <span>字段名: {item.field}</span>}
            </div>
          );
        });
      },
    },
    {
      label: 'Group By',
      key: 'query',
      render(query) {
        return _.map(query?.group_by, (item, idx) => {
          return (
            <div key={idx} style={{ backgroundColor: '#fafafa', padding: 8 }}>
              <span className='pr16'>类型: {item.cate}</span>
              {item.cate === 'filters' &&
                _.map(item.params, (param, subIdx) => {
                  return (
                    <div key={subIdx}>
                      <span className='pr16'>查询条件：{param.query}</span>
                      <span className='pr16'>别名：{param.alias}</span>
                    </div>
                  );
                })}
              {item.cate === 'terms' ? (
                <>
                  <span className='pr16'>字段名: {item.field}</span>
                  <span className='pr16'>匹配个数: {item.interval || 0}</span>
                  <span className='pr16'>文档最小值: {item.min_value === undefined ? 0 : item.min_value}</span>
                </>
              ) : (
                <>
                  <span className='pr16'>字段名: {item.field}</span>
                  <span className='pr16'>步长: {item.interval || '无'}</span>
                  <span className='pr16'>最小值: {item.min_value === undefined ? '无' : item.min_value}</span>
                </>
              )}
            </div>
          );
        });
      },
    },
    {
      label: '日期',
      key: 'query',
      render(query) {
        return (
          <>
            <span className='pr16'>日期字段: {query?.date_field}</span>
            <span className='pr16'>
              时间间隔: {query?.interval} {query?.interval_unit}
            </span>
          </>
        );
      },
    },
    {
      label: '告警条件',
      key: 'query',
      render(query) {
        return _.map(query?.rules, (item, idx) => {
          return (
            <div key={idx} style={{ backgroundColor: '#fafafa', padding: 8 }}>
              {_.map(item.rule, (rule, subIdx) => {
                return (
                  <div key={`${idx} ${subIdx}`}>
                    <span className='pr16'>
                      {rule.value}: {rule.func} {rule.op} {rule.threshold} {subIdx < item.rule.length - 1 ? item.rule_op : ''} 触发{severityMap[item.severity]}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        });
      },
    },
  ];
}
