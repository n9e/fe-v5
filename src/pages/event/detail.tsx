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
import { getAlertEventsById, getHistoryEventsById, getBrainData } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import PromQLInput from '@/components/PromQLInput';
import { TimeRangePickerWithRefresh, IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import Resolution from '@/components/Resolution';
import { deleteAlertEventsModal } from '.';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getStepByTimeAndStep } from '@/pages/dashboard/utils';
import Graph from './Graph';
import './detail.less';

const { Paragraph } = Typography;
const getUUIDByTags = (tags: string[]) => {
  let uuid = '';
  _.forEach(tags, (tag) => {
    const arr = _.split(tag, 'uuid=');
    if (arr[1]) {
      uuid = arr[1];
    }
  });
  return uuid;
};
const serieColorMap = {
  origin: '#573BA7',
  upper_bound: '#1A94FF',
  lower_bound: '#2ACA96',
  anomaly: 'red',
};
const EventDetailPage: React.FC = () => {
  const { busiId, eventId } = useParams<{ busiId: string; eventId: string }>();
  const { busiGroups } = useSelector<RootState, CommonStoreState>((state) => state.common);
  useEffect(() => {}, [busiGroups]);
  const handleNavToWarningList = (id) => {
    if (busiGroups.find((item) => item.id === id)) {
      history.push(`/alert-rules?id=${id}`);
    } else {
      message.error('该业务组已删除或无查看权限');
    }
  };
  const history = useHistory();
  const [isHistory, setIsHistory] = useState<boolean>(history.location.pathname.includes('alert-his-events'));
  const [eventDetail, setEventDetail] = useState<any>();
  const [descriptionInfo, setDescriptionInfo] = useState([
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
    { label: '触发时值', key: 'trigger_value' },
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
  ]);
  const [range, setRange] = useState<IRawTimeRange>({
    start: 'now-1h',
    end: 'now',
  });
  const [step, setStep] = useState<number | null>(15);
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    const requestPromise = isHistory ? getHistoryEventsById(busiId, eventId) : getAlertEventsById(busiId, eventId);
    requestPromise.then((res) => {
      setEventDetail(res.dat);
    });
  }, [busiId, eventId]);

  useEffect(() => {
    if (eventDetail && eventDetail.rule_algo) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).unix();
      const end = moment(parsedRange.end).unix();
      let _step = step;
      if (!step) _step = Math.max(Math.floor((end - start) / 240), 1);
      getBrainData({
        rid: eventDetail.rule_id,
        uuid: getUUIDByTags(eventDetail.tags),
        start,
        end,
        step: _step,
      }).then((res) => {
        const dat = _.map(
          _.filter(res.data, (item) => {
            return item.metric.value_type !== 'predict';
          }),
          (item) => {
            const type = item.metric.value_type;
            return {
              name: `${type}`,
              data: item.values,
              color: serieColorMap[type],
              lineDash: type === 'origin' || type === 'anomaly' ? [] : [4, 4],
            };
          },
        );
        const newSeries: any[] = [];
        const origin = _.cloneDeep(_.find(dat, { name: 'origin' }));
        const lower = _.find(dat, { name: 'lower_bound' });
        const upper = _.find(dat, { name: 'upper_bound' });

        newSeries.push({
          name: 'lower_upper_bound',
          data: _.map(lower.data, (dataItem, idx) => {
            return [...dataItem, upper.data[idx][1]];
          }),
          color: '#ddd',
          opacity: 0.5,
        });

        newSeries.push(origin);
        setSeries(newSeries);
      });
    }
  }, [JSON.stringify(eventDetail), JSON.stringify(range), step]);

  return (
    <PageLayout title='告警详情' showBack hideCluster>
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
                {eventDetail.rule_algo && (
                  <div>
                    <Space>
                      <TimeRangePickerWithRefresh value={range} onChange={setRange} refreshTooltip={`刷新间隔小于 step(${getStepByTimeAndStep(range, step)}s) 将不会更新数据`} />
                      <Resolution value={step} onChange={(v) => setStep(v)} initialValue={step} />
                    </Space>
                    <Graph series={series} />
                  </div>
                )}
                {descriptionInfo
                  .filter((item) => {
                    return eventDetail.is_recovered ? true : item.key !== 'recover_time';
                  })
                  .map(({ label, key, render }, i) => {
                    return (
                      <div className='desc-row' key={key + i}>
                        <div className='desc-label'>{label}：</div>
                        <div className='desc-content'>{render ? render(eventDetail[key], eventDetail) : eventDetail[key]}</div>
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
