import React, { useState, useRef, useEffect } from 'react';
import PageLayout from '@/components/pageLayout';
import {
  warningEventItem,
  warningPriority,
  warningStatus,
  warningLabel,
} from '@/store/eventInterface';
import BaseTable from '@/components/BaseTable';
import SearchInput from '@/components/BaseSearchInput';
import { getAlertEvents, deleteAlertEvents } from '@/services/warning';
import { ColumnType } from 'antd/lib/table';
import ColorTag from '@/components/ColorTag';
import {
  Tag,
  Select,
  Modal,
  message,
  Button,
  Descriptions,
  Row,
  Col,
  Pagination,
  Spin,
  Empty,
  Checkbox,
  Divider,
} from 'antd';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { priorityColor } from '@/utils/constant';
import { useDispatch } from 'react-redux';
import RefreshIcon from '@/components/RefreshIcon';
import './index.less';
import { AlertOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
const { Option } = Select;
const { confirm } = Modal;

const Event: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();
  const [query, setQuery] = useState<string>('');
  const [priority, setPriority] = useState<warningPriority | undefined>();
  const [status, setStatus] = useState<warningStatus | undefined>();
  const tableRef = useRef(null as any);
  const [tablelist, setTablelist] = useState<warningEventItem[]>([]);
  // const [defaultPageSize, setdefaultPageSize] = useState<number>(50);
  const [currennt, setcurrennt] = useState<number>(1);
  const [pageSize, setpageSize] = useState<number>(15);
  const [total, setTotal] = useState<number>(0);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]); //选中数组用给接口
  const [CheckboxAll, setCheckboxAll] = useState<boolean>(false); //判断选中所有状态
  const [indeterminate, setindeterminate] = useState<boolean>(false); //判断选中其中一些状态
  const [CheckboxItem, setCheckboxItem] = useState<number[]>([]); //选中那些checkbox用给Checkbox.Group
  const [lastPage, setlastPage] = useState<boolean>(false);
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
    });
  }, [pageSize, query, refresh, currennt, status, priority]);

  useEffect(() => {
    CheckboxStatus('none', []); //刷新页面，如果是全选状态翻页，设置为空状态
  }, [refresh, status, priority, currennt]);
  const CheckboxStatus = function (
    type: string,
    arr: boolean | Array<number> = false,
  ) {
    switch (type) {
      case 'all':
        setindeterminate(false); //选中全部
        setCheckboxAll(true);
        break;
      case 'indeterminate':
        console.log('indeterminate');
        setindeterminate(true); //选中部分
        setCheckboxAll(false);
        break;
      case 'none':
        setindeterminate(false); //一条都没选中
        setCheckboxAll(false);
        break;
    }
    if (Array.isArray(arr)) {
      console.log(type, arr);
      setCheckboxItem(arr);
      setSelectRowKeys(arr);
    }
  };
  const onPageCurrentSizeChange = function (currennt, size) {
    if (total <= currennt * size) {
      // 判断最后一页
      setlastPage(true);
    }
    setCheckboxItem([]);
    setSelectRowKeys([]);
    setcurrennt(currennt);
    setpageSize(size);
  };
  const onCheckboxChange = function (val) {
    let arr = [...val];
    let len = arr.length,
      allTableLen = tablelist.length;
    if (len == 0) {
      CheckboxStatus('none', arr);
    } else if (len == allTableLen) {
      CheckboxStatus('all', arr);
    } else {
      CheckboxStatus('indeterminate', arr);
    }
  };
  const selectRowKeyAll = function (val) {
    if (CheckboxAll) {
      // 重复点击选中全部
      CheckboxStatus('none', []);
    } else {
      //选中全部
      let res: number[] = [];
      tablelist.forEach((ele) => {
        res.push(ele.id);
      });
      CheckboxStatus('all', res);
    }
  };

  return (
    <PageLayout icon={<AlertOutlined />} title={t('未恢复告警事件')}>
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
          </div>
          <div className='event-table-search-right'>
            <Checkbox
              checked={CheckboxAll}
              style={{ marginRight: 21 }}
              onChange={selectRowKeyAll}
              indeterminate={indeterminate}
            ></Checkbox>

            <Button
              type='primary'
              style={{
                width: 102,
                textAlign: 'center',
                paddingLeft: 5,
                paddingRight: 5,
              }}
              disabled={selectRowKeys.length === 0}
              onClick={() => {
                confirm({
                  title: t('是否批量忽略告警?'),
                  onOk: () => {
                    console.log(lastPage);
                    if (lastPage && selectRowKeys.length == tablelist.length) {
                      console.log('setcurrennt');
                      setcurrennt(currennt - 1);
                    }
                    deleteAlertEvents(selectRowKeys as number[]).then(() => {
                      message.success(t('已忽略告警'));
                      setSelectRowKeys([]);
                      setRefresh(!refresh);
                    });
                  },

                  onCancel() {},
                });
              }}
            >
              {t('批量忽略')}
            </Button>
          </div>
        </div>
        <Spin spinning={spinning}>
          <Checkbox.Group
            style={{ width: '100%' }}
            value={CheckboxItem}
            onChange={onCheckboxChange}
          >
            <div className={'evenTable'}>
              {tablelist.length > 0 ? (
                tablelist.map((ele: warningEventItem, index) => {
                  return (
                    <div className='table-item' key={ele.id}>
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
                                        <ColorTag
                                          text={tag.nickname}
                                        ></ColorTag>
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
                          <Checkbox
                            value={ele.id}
                            className={'Checkbox'}
                            key={index}
                          ></Checkbox>
                          <Divider type='vertical' />

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
                          <Divider type='vertical' />
                          <a
                            style={{
                              color: 'red',
                              cursor: 'pointer',
                              width: 35,
                              display: 'inline-block',
                            }}
                            onClick={() => {
                              confirm({
                                title: t('是否忽略告警?'),
                                onOk: () => {
                                  if (lastPage && tablelist.length == 1) {
                                    console.log('setcurrennt');
                                    setcurrennt(currennt - 1);
                                  }
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
          </Checkbox.Group>
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
