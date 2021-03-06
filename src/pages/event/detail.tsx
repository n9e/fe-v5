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
import DateRangePicker from '@/components/DateRangePicker';
import Resolution from '@/components/Resolution';
import { Range, formatPickerDate } from '@/components/DateRangePicker';
import { deleteAlertEventsModal } from '.';
import Graph from './Graph';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
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
      message.error('???????????????????????????????????????');
    }
  };
  const history = useHistory();
  const [isHistory, setIsHistory] = useState<boolean>(history.location.pathname.includes('alert-his-events'));
  const [eventDetail, setEventDetail] = useState<any>();
  const [descriptionInfo, setDescriptionInfo] = useState([
    {
      label: '????????????',
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
      label: '?????????',
      key: 'group_name',
      render(content, { group_id }) {
        return (
          <Button size='small' type='link' className='rule-link-btn' onClick={() => handleNavToWarningList(group_id)}>
            {content}
          </Button>
        );
      },
    },
    { label: '????????????', key: 'rule_note' },
    { label: '????????????', key: 'cluster' },
    {
      label: '????????????',
      key: 'severity',
      render: (severity) => {
        return <Tag color={priorityColor[severity - 1]}>S{severity}</Tag>;
      },
    },
    {
      label: '????????????',
      key: 'is_recovered',
      render(isRecovered) {
        return <Tag color={isRecovered ? 'green' : 'red'}>{isRecovered ? 'Recovered' : 'Triggered'}</Tag>;
      },
    },
    {
      label: '????????????',
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
    { label: '????????????', key: 'target_note' },
    {
      label: '????????????',
      key: 'trigger_time',
      render(time) {
        return moment(time * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    { label: '????????????', key: 'trigger_value' },
    {
      label: '????????????',
      key: 'recover_time',
      render(time) {
        return moment((time || 0) * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      label: '????????????',
      key: 'rule_algo',
      render(text) {
        if (text) {
          return '????????????';
        }
        return '????????????';
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
      label: '????????????',
      key: 'prom_eval_interval',
      render(content) {
        return `${content} ???`;
      },
    },
    {
      label: '????????????',
      key: 'prom_for_duration',
      render(content) {
        return `${content} ???`;
      },
    },
    {
      label: '????????????',
      key: 'notify_channels',
      render(channels) {
        return channels.join(' ');
      },
    },
    {
      label: '???????????????',
      key: 'notify_groups_obj',
      render(groups) {
        return groups ? groups.map((group) => <Tag color='purple'>{group.name}</Tag>) : '';
      },
    },
    {
      label: '????????????',
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
      label: '????????????',
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
  const [range, setRange] = useState<Range>({
    num: 1,
    unit: 'hour',
    description: '',
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
      let { start, end } = formatPickerDate(range);
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
    <PageLayout title='????????????' showBack hideCluster>
      <div className='event-detail-container'>
        <Spin spinning={!eventDetail}>
          <Card
            className='desc-container'
            title='??????????????????'
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
                    ??????
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
                          message.warn('???????????????????????????ID');
                        }
                      }}
                    >
                      ??????
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
                      <DateRangePicker value={range} onChange={setRange} />
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
                        <div className='desc-label'>{label}???</div>
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
