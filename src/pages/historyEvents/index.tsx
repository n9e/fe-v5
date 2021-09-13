import React, { useState, useRef, useEffect } from 'react';
import PageLayout from '@/components/pageLayout';
import {
  warningEventItem,
  warningPriority,
  warningStatus,
  IsRecovery,
} from '@/store/eventInterface';
import SearchInput from '@/components/BaseSearchInput';
import { getHistoryEvents } from '@/services/warning';
import ColorTag from '@/components/ColorTag';
import { Tag, Select, Row, Col, Pagination, Spin, Empty, Divider } from 'antd';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { priorityColor } from '@/utils/constant';
import { useDispatch } from 'react-redux';
import RefreshIcon from '@/components/RefreshIcon';
import { AlertOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;

const Event: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const [query, setQuery] = useState<string>('');
  const [priority, setPriority] = useState<warningPriority | undefined>();
  const [status, setStatus] = useState<warningStatus | undefined>();
  const [tablelist, setTablelist] = useState<warningEventItem[]>([]);
  const [currennt, setcurrennt] = useState<number>(1);
  const [pageSize, setpageSize] = useState<number>(15);
  const [total, setTotal] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isRecovery, setIsRecovery] = useState<IsRecovery | undefined>();
  useEffect(() => {
    setSpinning(true);
    getHistoryEvents({
      query,
      p: currennt,
      limit: pageSize,
      priority,
      is_recovery: isRecovery,
      status,
    }).then((res) => {
      setTablelist(res.dat.list);
      setTotal(res.dat.total);
      setSpinning(false);
    });
  }, [pageSize, query, refresh, isRecovery, currennt, status, priority]);

  const onPageCurrentSizeChange = function (currennt, size) {
    setcurrennt(currennt);
    setpageSize(size);
  };

  return (
    <PageLayout icon={<AlertOutlined />} title={t('全量告警历史')}>
      <div className='event-content'>
        <div className='event-table-search'>
          <div className='event-table-search-left'>
            <RefreshIcon
              className='event-table-search-left-refresh'
              onClick={() => {
                setRefresh(!refresh);
              }}
            />
            <SearchInput
              placeholder={t('策略名称、标签、资源分组')}
              onSearch={setQuery}
              className={'searchInput'}
              style={{
                marginRight: 8,
              }}
            ></SearchInput>
            <Select
              placeholder={t('告警级别')}
              allowClear
              style={{
                width: 90,
              }}
              onChange={(value) => {
                if (typeof value !== 'undefined') {
                  setPriority(Number(value));
                } else {
                  setPriority(undefined);
                }
              }}
            >
              <Option value={warningPriority.First}>
                P{warningPriority.First}
              </Option>
              <Option value={warningPriority.Second}>
                P{warningPriority.Second}
              </Option>
              <Option value={warningPriority.Third}>
                P{warningPriority.Third}
              </Option>
            </Select>
            <Select
              placeholder={t('告警状态')}
              allowClear
              style={{
                width: 100,
              }}
              onChange={(value) => {
                if (typeof value !== 'undefined') {
                  setStatus(Number(value));
                } else {
                  setStatus(undefined);
                }
              }}
            >
              <Option value={warningStatus.Enable}>{t('已触发')}</Option>
              <Option value={warningStatus.UnEnable}>{t('已屏蔽')}</Option>
            </Select>
            <Select
              placeholder={t('通知类型')}
              allowClear
              style={{
                width: 100,
              }}
              onChange={(value) => {
                if (typeof value !== 'undefined') {
                  setIsRecovery(Number(value));
                } else {
                  setIsRecovery(undefined);
                }
              }}
            >
              <Option value={IsRecovery.Alert}>{t('告警')}</Option>
              <Option value={IsRecovery.Recovery}>{t('恢复')}</Option>
            </Select>
          </div>
        </div>
        <Spin spinning={spinning}>
          <div className={'evenTable'} style={{ marginTop: 0, paddingTop: 10 }}>
            {tablelist.length > 0 ? (
              tablelist.map((ele: warningEventItem, index) => {
                return (
                  <div
                    className='table-item'
                    key={ele.id}
                    style={{ marginTop: 0 }}
                  >
                    <Row className={'main_info'}>
                      <Col span={21}>
                        <Tag color={priorityColor[ele.priority - 1]}>
                          P{ele.priority}
                        </Tag>
                        <Divider type='vertical' />

                        <span>
                          {dayjs(ele.trigger_time * 1000).format(
                            'YYYY-MM-DD HH:mm:ss',
                          )}
                        </span>
                        <Divider type='vertical' />

                        <span>
                          {ele.status === warningStatus.Enable
                            ? t('已触发')
                            : t('已屏蔽')}
                        </span>
                        <Divider type='vertical' />
                        <span>
                          {ele.is_recovery === IsRecovery.Alert ? (
                            <a style={{ color: '#ff4d4f' }}>{t('告警')}</a>
                          ) : (
                            <a style={{ color: '#52c41a' }}>{t('恢复')}</a>
                          )}
                        </span>
                        <Divider type='vertical' />

                        <a
                          className={'name'}
                          onClick={() => {
                            dispatch({
                              type: `event/editItem`,
                              data: ele,
                            });
                            history.push('/event-history/' + ele.id);
                          }}
                          key={index}
                        >
                          {ele.rule_name}
                        </a>

                        {
                          <>
                            {ele.notify_user_objs
                              ? ele.notify_user_objs.map((tag, index) => {
                                  return tag ? (
                                    <span key={index}>
                                      <Divider type='vertical' />
                                      <ColorTag text={tag.nickname}></ColorTag>
                                    </span>
                                  ) : null;
                                })
                              : ''}
                          </>
                        }
                      </Col>
                      <Col
                        span={3}
                        className={'non-border'}
                        style={{ textAlign: 'right', paddingRight: 10 }}
                      >
                        <a
                          style={{
                            cursor: 'pointer',
                            width: 35,
                            display: 'inline-block',
                          }}
                          onClick={() => {
                            dispatch({
                              type: `event/editItem`,
                              data: ele,
                            });
                            history.push('/shield/add/event');
                          }}
                        >
                          {t('屏蔽')}
                        </a>
                      </Col>
                    </Row>
                    <Row className={'table-item-scoure'}>
                      <Col span={24}>
                        <Row className={'item-Row'}>
                          <Col span={1}>{t('标签')} :</Col>
                          <Col span={22}>
                            <div className={'table-item-content'}>
                              {
                                <>
                                  {ele.tags
                                    ? ele.tags
                                        .trim()
                                        .split(' ')
                                        .map((tag, index) => {
                                          return tag ? (
                                            <ColorTag
                                              text={tag}
                                              key={index}
                                            ></ColorTag>
                                          ) : null;
                                        })
                                    : ''}
                                </>
                              }
                              <div className={'table-item-title'}>
                                {ele.res_classpaths ? (
                                  <span>{t('资源分组')}:</span>
                                ) : (
                                  ''
                                )}
                              </div>
                              <div className={'table-item-content'}>
                                {
                                  <>
                                    {ele.res_classpaths
                                      ? ele.res_classpaths
                                          .split(' ')
                                          .map((tag, index) => {
                                            return tag ? (
                                              <ColorTag
                                                text={tag}
                                                key={index}
                                              ></ColorTag>
                                            ) : null;
                                          })
                                      : ''}
                                  </>
                                }
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                );
              })
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{
                  height: 135,
                  border: '1px solid #dbdee3',
                  padding: 30,
                }}
              />
            )}
          </div>
        </Spin>
        {tablelist.length > 0 ? (
          <div className={'event-Pagination'}>
            <Pagination
              total={total}
              showTotal={(total) => `Total ${total} items`}
              defaultPageSize={pageSize}
              current={currennt}
              onChange={onPageCurrentSizeChange}
            />
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
};

export default Event;
