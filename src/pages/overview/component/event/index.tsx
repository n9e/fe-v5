import React, { useEffect, useRef, useState } from 'react';
import {
  Tag,
  Modal,
  message,
  Button,
  Row,
  Col,
  Switch,
  Pagination,
  Spin,
  Checkbox,
  Empty,
  Divider,
} from 'antd';
import BaseTable from '@/components/BaseTable';
import SearchInput from '@/components/BaseSearchInput';
import { getAlertEvents, deleteAlertEvents } from '@/services/warning';
import { ColumnType } from 'antd/lib/table';
import ColorTag from '@/components/ColorTag';
import IconFont from '@/components/IconFont';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { priorityColor } from '@/utils/constant';
import { useDispatch } from 'react-redux';
import {
  warningEventItem,
  warningLabel,
  warningPriority,
  warningStatus,
} from '@/store/eventInterface';
import { eventProps } from '@/store/overview';
import { useTranslation } from 'react-i18next';
import './index.less';
const { confirm } = Modal;

const Event: React.FC<eventProps> = (props: eventProps) => {
  const { t } = useTranslation();
  const { event_total_day, event_total_month, event_total_week } = props;
  const [query, setQuery] = useState<string>('');
  const tableRef = useRef(null as any);
  const dispatch = useDispatch();
  const history = useHistory();
  const [tablelist, setTablelist] = useState<warningEventItem[]>([]);
  // const [defaultPageSize, setdefaultPageSize] = useState<number>(50);
  const [priority, setPriority] = useState<warningPriority | undefined>();

  const [currennt, setcurrennt] = useState<number>(1);
  const [pageSize, setpageSize] = useState<number>(15);
  const [total, setTotal] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  let timer: any;
  const [refreshStatus, setRefreshStatus] = useState<boolean>(true);
  useEffect(() => {
    setSpinning(true);
    getAlertEvents({
      query,
      p: currennt,
      limit: pageSize,
      priority,
      status,
    }).then((res) => {
      setTablelist(res.dat.list);
      setTotal(res.dat.total);
      setSpinning(false);
      console.log(res);
    });
  }, [pageSize, query, refresh, currennt, status, priority]);
  useEffect(() => {
    if (refreshStatus) {
      timer = setInterval(() => {
        setRefresh(!refresh);
      }, 60 * 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, []);

  function enterEvent() {
    history.push('/event');
  }

  function frechChange(checked) {
    setRefreshStatus(checked);
  }
  const onPageSizeChange = function (currennt, size) {
    setcurrennt(currennt);
    setpageSize(size);
  };
  return (
    <div className='part event_part'>
      <div className='event_t'>
        <span className='title'>{t('告警事件')}</span>
      </div>
      <div>
        <Row justify='start' gutter={18}>
          <Col>
            <div className='list day_part'>
              <div className='name'>
                {t('近')} 1 {t('day-events')}
              </div>
              <div className='num'>{event_total_day}</div>
              <IconFont
                className='list_icon'
                type='icon-a-1tianweihuifu'
              ></IconFont>
            </div>
          </Col>
          <Col>
            <div className='list week_part'>
              <div className='name'>
                {t('近')} 7 {t('天未恢复的')}
              </div>
              <div className='num'>{event_total_week}</div>
              <IconFont
                className='list_icon'
                type='icon-a-7tianweihuifu'
              ></IconFont>
            </div>
          </Col>
          <Col>
            <div className='list month_part'>
              <div className='name'>
                {t('近')} 30 {t('天未恢复的')}
              </div>
              <div className='num'>{event_total_month}</div>
              <IconFont
                className='list_icon'
                type='icon-a-30tianweihuifu'
              ></IconFont>
            </div>
          </Col>
        </Row>
        <div className='refresh_con clearfix'>
          <SearchInput
            className={'searchInput'}
            placeholder={t('策略名称、标签、资源分组')}
            onSearch={setQuery}
          ></SearchInput>
          <Switch
            style={{
              marginLeft: '15px',
              marginRight: '15px',
            }}
            defaultChecked
            onChange={frechChange}
          ></Switch>
          {t('一分钟自动刷新')}
          <span className='float_r refresh_icon'>
            <a className='enterEventBtn' type='primary' onClick={enterEvent}>
              {t('进入事件管理')}
            </a>
          </span>
        </div>

        <Spin spinning={spinning}>
          <div className={'evenTable'}>
            {tablelist.length > 0 ? (
              tablelist.map((ele: warningEventItem, index) => {
                return (
                  <div className='table-item' key={index}>
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

                        <a
                          className={'name'}
                          onClick={() => {
                            dispatch({
                              type: `event/editItem`,
                              data: ele,
                            });
                            history.push('/event/' + ele.id);
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
                          style={{ cursor: 'pointer' }}
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
                        <Divider type='vertical' />
                        <a
                          style={{ color: 'red', cursor: 'pointer' }}
                          onClick={() => {
                            confirm({
                              title: t('是否忽略告警?'),
                              onOk: () => {
                                deleteAlertEvents([ele.id]).then(() => {
                                  message.success(t('已忽略告警'));
                                  setRefresh(!refresh);
                                });
                              },
                              onCancel() {},
                            });
                          }}
                        >
                          {t('忽略')}
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
              onChange={onPageSizeChange}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Event;
