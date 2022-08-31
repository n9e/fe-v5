/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import moment from 'moment';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { Button, Card, Col, message, Row, Space, Spin, Tag, Typography } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import { getAlertEventsById, getHistoryEventsById } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import PromQLInput from '@/components/PromQLInput';
import { deleteAlertEventsModal } from '.';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { parseValues } from '@/pages/warning/strategy/components/utils';
import { severityMap } from '@/pages/warning/strategy/components/ElasticsearchSettings/Rules';
import Preview from './Preview';
import LogsDetail from './LogsDetail';
import './detail.less';

const { Paragraph } = Typography;
const EventDetailPage: React.FC = () => {
  const { busiId, eventId } = useParams<{ busiId: string; eventId: string }>();
  const { busiGroups } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const handleNavToWarningList = (id) => {
    if (busiGroups.find((item) => item.id === id)) {
      history.push(`/alert-rules?id=${id}`);
    } else {
      message.error('该业务组已删除或无查看权限');
    }
  };
  const history = useHistory();
  const isHistory = history.location.pathname.includes('alert-his-events');
  const [eventDetail, setEventDetail] = useState<any>();
  const [logsDetailVisible, setLogsDetailVisible] = useState<boolean>(false);
  if (eventDetail) eventDetail.cate = eventDetail.cate || 'prometheus'; // TODO: 兼容历史的告警事件
  const parsedEventDetail = parseValues(eventDetail);
  const descriptionInfo = [
    {
      label: '规则标题',
      key: 'rule_name',
      render(content, { rule_id }) {
        return (
          <Button
            size='small'
            type='link'
            className='rule-link-btn'
            onClick={() => {
              history.push(`/alert-rules/edit/${rule_id}`);
            }}
          >
            {content}
          </Button>
        );
      },
    },
    {
      label: '业务组',
      key: 'group_name',
      render(content, { group_id }) {
        return (
          <Button size='small' type='link' className='rule-link-btn' onClick={() => handleNavToWarningList(group_id)}>
            {content}
          </Button>
        );
      },
    },
    { label: '规则备注', key: 'rule_note' },
    { label: '所属集群', key: 'cluster' },
    {
      label: '告警级别',
      key: 'severity',
      render: (severity) => {
        return <Tag color={priorityColor[severity - 1]}>S{severity}</Tag>;
      },
    },
    {
      label: '事件状态',
      key: 'is_recovered',
      render(isRecovered) {
        return <Tag color={isRecovered ? 'green' : 'red'}>{isRecovered ? 'Recovered' : 'Triggered'}</Tag>;
      },
    },
    {
      label: '事件标签',
      key: 'tags',
      render(tags) {
        return tags
          ? tags.map((tag) => (
              <Tag color='purple' key={tag}>
                {tag}
              </Tag>
            ))
          : '';
      },
    },
    { label: '对象备注', key: 'target_note' },
    {
      label: '触发时间',
      key: 'trigger_time',
      render(time) {
        return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      label: '触发时值',
      key: 'trigger_value',
      render(val) {
        return (
          <span>
            {val}
            <Button
              size='small'
              style={{ marginLeft: 16 }}
              onClick={() => {
                setLogsDetailVisible(true);
              }}
            >
              日志详情
            </Button>
          </span>
        );
      },
    },
    {
      label: '恢复时间',
      key: 'recover_time',
      render(time) {
        return moment((time || 0) * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      label: '告警方式',
      key: 'rule_algo',
      render(text) {
        if (text) {
          return '智能告警';
        }
        return '阈值告警';
      },
    },
    eventDetail?.cate === 'elasticsearch' && {
      label: '数据源类型',
      key: 'cate',
    },
    eventDetail?.cate === 'prometheus' && {
      label: 'PromQL',
      key: 'prom_ql',
      render(promql) {
        return (
          <Row className='promql-row'>
            <Col span={20}>
              <PromQLInput value={promql} url='/api/n9e/prometheus' readonly />
            </Col>
            <Col span={4}>
              <Button
                className='run-btn'
                type='link'
                onClick={() => {
                  window.open(`${location.origin}/metric/explorer?promql=${encodeURIComponent(promql)}`);
                }}
              >
                <PlayCircleOutlined className='run-con' />
              </Button>
            </Col>
          </Row>
        );
      },
    },
    eventDetail?.cate === 'elasticsearch' && {
      label: '索引',
      key: 'query',
      render(query) {
        return query?.index;
      },
    },
    eventDetail?.cate === 'elasticsearch' && {
      label: '过滤项',
      key: 'query',
      render(query) {
        return query?.filter || '无';
      },
    },
    eventDetail?.cate === 'elasticsearch' && {
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
    eventDetail?.cate === 'elasticsearch' && {
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
    eventDetail?.cate === 'elasticsearch' && {
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
    eventDetail?.cate === 'elasticsearch' && {
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
    {
      label: '执行频率',
      key: 'prom_eval_interval',
      render(content) {
        return `${content} 秒`;
      },
    },
    {
      label: '持续时长',
      key: 'prom_for_duration',
      render(content) {
        return `${content} 秒`;
      },
    },
    {
      label: '通知媒介',
      key: 'notify_channels',
      render(channels) {
        return channels.join(' ');
      },
    },
    {
      label: '告警接收组',
      key: 'notify_groups_obj',
      render(groups) {
        return groups ? groups.map((group) => <Tag color='purple'>{group.name}</Tag>) : '';
      },
    },
    {
      label: '回调地址',
      key: 'callbacks',
      render(callbacks) {
        return callbacks
          ? callbacks.map((callback) => (
              <Tag>
                <Paragraph copyable style={{ margin: 0 }}>
                  {callback}
                </Paragraph>
              </Tag>
            ))
          : '';
      },
    },
    {
      label: '预案链接',
      key: 'runbook_url',
      render(url) {
        return (
          <a href={url} target='_balank'>
            {url}
          </a>
        );
      },
    },
  ];

  useEffect(() => {
    const requestPromise = isHistory ? getHistoryEventsById(busiId, eventId) : getAlertEventsById(busiId, eventId);
    requestPromise.then((res) => {
      setEventDetail(res.dat);
    });
  }, [busiId, eventId]);

  return (
    <PageLayout title='告警详情' showBack backPath='/alert-his-events' hideCluster>
      <div className='event-detail-container'>
        <Spin spinning={!eventDetail}>
          <Card
            className='desc-container'
            title='告警事件详情'
            actions={[
              <div className='action-btns'>
                <Space>
                  <Button
                    type='primary'
                    onClick={() => {
                      history.push('/alert-mutes/add', {
                        group_id: eventDetail.group_id,
                        cate: eventDetail.cate,
                        cluster: eventDetail.cluster,
                        tags: eventDetail.tags
                          ? eventDetail.tags.map((tag) => {
                              const [key, value] = tag.split('=');
                              return {
                                func: '==',
                                key,
                                value,
                              };
                            })
                          : [],
                      });
                    }}
                  >
                    屏蔽
                  </Button>
                  {!isHistory && (
                    <Button
                      danger
                      onClick={() => {
                        if (eventDetail.group_id) {
                          deleteAlertEventsModal(eventDetail.group_id, [Number(eventId)], () => {
                            history.replace('/alert-cur-events');
                          });
                        } else {
                          message.warn('该告警未返回业务组ID');
                        }
                      }}
                    >
                      删除
                    </Button>
                  )}
                </Space>
              </div>,
            ]}
          >
            {eventDetail && (
              <div>
                {parsedEventDetail.rule_algo || parsedEventDetail.cate === 'elasticsearch' ? <Preview data={parsedEventDetail} /> : null}
                {descriptionInfo
                  .filter((item: any) => {
                    if (!item) return false;
                    return parsedEventDetail.is_recovered ? true : item.key !== 'recover_time';
                  })
                  .map(({ label, key, render }: any, i) => {
                    return (
                      <div className='desc-row' key={key + i}>
                        <div className='desc-label'>{label}：</div>
                        <div className='desc-content'>{render ? render(parsedEventDetail[key], parsedEventDetail) : parsedEventDetail[key]}</div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </Spin>
      </div>
      <LogsDetail
        id={eventId}
        visible={logsDetailVisible}
        onClose={() => {
          setLogsDetailVisible(false);
        }}
      />
    </PageLayout>
  );
};

export default EventDetailPage;
