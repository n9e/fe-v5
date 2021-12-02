import PageLayout from '@/components/pageLayout';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { getAlertEventsById, getHistoryEventsById } from '@/services/warning';
import { Button, Card, Col, Row, Space, Spin, Tag, Typography } from 'antd';
import { priorityColor } from '@/utils/constant';
import './detail.less';
import moment from 'moment';
import { PlayCircleOutlined } from '@ant-design/icons';
import PromqlEditor from '@/components/PromqlEditor';
import { deleteAlertEventsModal } from '.';

const { Paragraph } = Typography;

const EventDetailPage: React.FC = () => {
  const { busiId, eventId } = useParams<{ busiId: string; eventId: string }>();
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
        return tags.map((tag) => <Tag color='blue'>{tag}</Tag>);
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
      label: 'PromQL',
      key: 'prom_ql',
      render(promql) {
        return (
          <Row className='promql-row'>
            <Col span={20}>
              <PromqlEditor className='promql-editor' xCluster='Default' value={promql} editable={false} />
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
      label: '执行时长',
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
        return groups.map((group) => <Tag color='blue'>{group.name}</Tag>);
      },
    },
    {
      label: '回调地址',
      key: 'callbacks',
      render(callbacks) {
        return callbacks.map((callback) => (
          <Tag>
            <Paragraph copyable style={{ margin: 0 }}>
              {callback}
            </Paragraph>
          </Tag>
        ));
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

  useEffect(() => {
    const requestPromise = isHistory ? getHistoryEventsById(busiId, eventId) : getAlertEventsById(busiId, eventId);
    requestPromise.then((res) => setEventDetail(res.dat));
  }, [busiId, eventId]);

  return (
    <PageLayout title='告警详情' showBack>
      <div className='event-detail-container'>
        <Spin spinning={!eventDetail}>
          <Card
            className='desc-container'
            title='告警事件详情'
            actions={[
              <div className='action-btns'>
                <Space>
                  <Button type='primary'>屏蔽</Button>
                  {!isHistory && (
                    <Button
                      danger
                      onClick={() =>
                        deleteAlertEventsModal(busiId, [Number(eventId)], () => {
                          history.replace('/alert-cur-events');
                        })
                      }
                    >
                      删除
                    </Button>
                  )}
                </Space>
              </div>,
            ]}
          >
            {eventDetail &&
              descriptionInfo.map(({ label, key, render }) => {
                return (
                  <div className='desc-row'>
                    <div className='desc-label'>{label}：</div>
                    <div className='desc-content'>{render ? render(eventDetail[key], eventDetail) : eventDetail[key]}</div>
                  </div>
                );
              })}
          </Card>
        </Spin>
      </div>
    </PageLayout>
  );
};

export default EventDetailPage;
