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
import { Button, Card, message, Space, Spin, Tag, Typography } from 'antd';
import PageLayout from '@/components/pageLayout';
import { getAlertEventsById, getHistoryEventsById } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import { deleteAlertEventsModal } from '.';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { parseValues } from '@/pages/warning/strategy/components/utils';
import Preview from './Preview';
import LogsDetail from './LogsDetail';
import PrometheusDetail from './Detail/Prometheus';
import ElasticsearchDetail from './Detail/Elasticsearch';
import AliyunSLSDetail from './Detail/AliyunSLS';
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
            {eventDetail?.cate === 'elasticsearch' && (
              <Button
                size='small'
                style={{ marginLeft: 16 }}
                onClick={() => {
                  LogsDetail.Elasticsearch({
                    id: eventId,
                    start: eventDetail.trigger_time - 2 * eventDetail.prom_eval_interval,
                    end: eventDetail.trigger_time + eventDetail.prom_eval_interval,
                  });
                }}
              >
                日志详情
              </Button>
            )}
            {eventDetail?.cate === 'aliyun-sls' && (
              <Button
                size='small'
                style={{ marginLeft: 16 }}
                onClick={() => {
                  LogsDetail.AliyunSLS({
                    id: eventId,
                    start: eventDetail.trigger_time - 2 * eventDetail.prom_eval_interval,
                    end: eventDetail.trigger_time + eventDetail.prom_eval_interval,
                  });
                }}
              >
                日志详情
              </Button>
            )}
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
    {
      label: '数据源类型',
      key: 'cate',
    },
    ...(eventDetail?.cate === 'prometheus'
      ? PrometheusDetail({
          eventDetail,
          history,
        })
      : [false]),
    ...(eventDetail?.cate === 'elasticsearch' ? ElasticsearchDetail() : [false]),
    ...(eventDetail?.cate === 'aliyun-sls' ? AliyunSLSDetail() : [false]),
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
                {parsedEventDetail.rule_algo || parsedEventDetail.cate === 'elasticsearch' || parsedEventDetail.cate === 'aliyun-sls' ? (
                  <Preview
                    data={parsedEventDetail}
                    triggerTime={eventDetail.trigger_time}
                    onClick={(event, datetime) => {
                      if (parsedEventDetail.cate === 'elasticsearch') {
                        LogsDetail.Elasticsearch({
                          id: eventId,
                          start: moment(datetime).unix() - 2 * eventDetail.prom_eval_interval,
                          end: moment(datetime).unix() + eventDetail.prom_eval_interval,
                        });
                      } else if (parsedEventDetail.cate === 'aliyun-sls') {
                        LogsDetail.AliyunSLS({
                          id: eventId,
                          start: moment(datetime).unix() - 2 * eventDetail.prom_eval_interval,
                          end: moment(datetime).unix() + eventDetail.prom_eval_interval,
                        });
                      }
                    }}
                  />
                ) : null}
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
    </PageLayout>
  );
};

export default EventDetailPage;
