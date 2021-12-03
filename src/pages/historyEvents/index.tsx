import React, { useEffect, useMemo, useRef, useState } from 'react';
import PageLayout from '@/components/pageLayout';
import { AlertOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LeftTree from '@/components/LeftTree';
import DataTable from '@/components/Dantd/components/data-table';
import moment from 'moment';
import { Button, Input, Modal, Tag, Tooltip } from 'antd';
import DateRangePicker, { RelativeRange } from '@/components/DateRangePicker';
import { priorityColor } from '@/utils/constant';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { eventStoreState } from '@/store/eventInterface';
import { CommonStoreState } from '@/store/commonInterface';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
// import './index.less';

const Event: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tableRef = useRef({
    handleReload() {},
  });
  const { curClusterItems } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const { hisSeverity, hisEventType, hisHourRange, hisQueryContent } = useSelector<RootState, eventStoreState>((state) => state.event);
  const isAddTagToQueryInput = useRef(false);
  const [curBusiId, setCurBusiId] = useState<number>(-1);
  const DateRangeItems: RelativeRange[] = useMemo(
    () => [
      { num: 6, unit: 'hours', description: t('hours') },
      { num: 12, unit: 'hours', description: t('hours') },
      { num: 1, unit: 'day', description: t('天') },
      { num: 2, unit: 'days', description: t('天') },
      { num: 3, unit: 'days', description: t('天') },
      { num: 7, unit: 'days', description: t('天') },
      { num: 14, unit: 'days', description: t('天') },
      { num: 30, unit: 'days', description: t('天') },
      { num: 60, unit: 'days', description: t('天') },
      { num: 90, unit: 'days', description: t('天') },
    ],
    [],
  );

  const columns = [
    {
      title: t('集群'),
      dataIndex: 'cluster',
      width: 120,
    },
    {
      title: t('级别'),
      dataIndex: 'severity',
      width: 70,
      render: (severity) => {
        return <Tag color={priorityColor[severity - 1]}>S{severity}</Tag>;
      },
    },
    {
      title: t('类别'),
      dataIndex: 'is_recovered',
      width: 110,
      render(isRecovered) {
        return <Tag color={isRecovered ? 'green' : 'red'}>{isRecovered ? 'Recovered' : 'Triggered'}</Tag>;
      },
    },
    {
      title: t('规则标题'),
      dataIndex: 'rule_name',
      render(title, { id }) {
        return (
          <Button size='small' type='link' style={{ padding: 0 }} onClick={() => history.push(`/alert-his-events/${curBusiId}/${id}`)}>
            {title}
          </Button>
        );
      },
    },
    {
      title: t('事件标签'),
      dataIndex: 'tags',
      ellipsis: {
        showTitle: false,
      },
      render(tagArr) {
        const content =
          tagArr &&
          tagArr
            .sort((a, b) => a.length - b.length)
            .map((item) => (
              <Tag
                color='blue'
                key={item}
                onClick={(e) => {
                  if (!hisQueryContent.includes(item)) {
                    isAddTagToQueryInput.current = true;
                    saveData('hisQueryContent', hisQueryContent ? `${hisQueryContent.trim()} ${item}` : item);
                  }
                }}
              >
                {item}
              </Tag>
            ));
        return (
          tagArr && (
            <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body} overlayClassName='mon-manage-table-tooltip'>
              <span className='event-tags'>{content}</span>
            </Tooltip>
          )
        );
      },
    },
    {
      title: t('告警接收组'),
      dataIndex: 'notify_groups_obj',
      ellipsis: {
        showTitle: false,
      },
      render(tagArr) {
        const content =
          tagArr &&
          tagArr
            .sort((a, b) => a.name.length - b.name.length)
            .map((item) => (
              <Tag color='blue' key={item.id}>
                {item.name}
              </Tag>
            ));
        return (
          tagArr && (
            <Tooltip title={content} placement='topLeft' getPopupContainer={() => document.body}>
              {content}
            </Tooltip>
          )
        );
      },
    },
    {
      title: t('触发时间'),
      dataIndex: 'trigger_time',
      width: 140,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];

  function renderLeftHeader() {
    return (
      <div className='table-operate-box'>
        <div className='left'>
          <DateRangePicker
            showRight={false}
            leftList={DateRangeItems}
            value={hisHourRange}
            onChange={(range: RelativeRange) => {
              if (range.num !== hisHourRange.num || range.unit !== hisHourRange.unit) {
                saveData('hisHourRange', range);
              }
            }}
          />
          <Input
            className='search-input'
            prefix={<SearchOutlined />}
            placeholder='模糊搜索规则和标签(多个关键词请用空格分隔)'
            value={hisQueryContent}
            onChange={(e) => saveData('hisQueryContent', e.target.value)}
            onPressEnter={(e) => tableRef.current.handleReload()}
          />
        </div>
      </div>
    );
  }

  function saveData(prop, data) {
    dispatch({
      type: 'event/saveData',
      prop,
      data,
    });
  }

  useEffect(() => {
    if (isAddTagToQueryInput.current) {
      tableRef.current.handleReload();
      isAddTagToQueryInput.current = false;
    }
  }, [hisQueryContent]);

  useEffect(() => {
    tableRef.current.handleReload();
  }, [curClusterItems, hisSeverity, hisHourRange, hisEventType]);

  return (
    <PageLayout icon={<AlertOutlined />} title={t('历史告警')} hideCluster>
      <div className='event-content'>
        <LeftTree
          clusterGroup={{
            isShow: true,
          }}
          busiGroup={{
            onChange(value) {
              setCurBusiId(typeof value === 'number' ? value : -1);
            },
          }}
          eventLevelGroup={{
            isShow: true,
            defaultSelect: hisSeverity,
            onChange(v: number | undefined) {
              saveData('hisSeverity', v);
            },
          }}
          eventTypeGroup={{
            isShow: true,
            defaultSelect: hisEventType,
            onChange(v: 0 | 1 | undefined) {
              saveData('hisEventType', v);
            },
          }}
        />
        <div className='table-area'>
          {curBusiId !== -1 ? (
            <DataTable
              ref={tableRef}
              antProps={{
                rowKey: 'id',
                scroll: { x: 800, y: 'calc(100vh - 252px)' },
              }}
              url={`/api/n9e/busi-group/${curBusiId}/alert-his-events`}
              customQueryCallback={(data) =>
                Object.assign(
                  data,
                  { hours: hisHourRange.unit !== 'hours' ? hisHourRange.num * 24 : hisHourRange.num },
                  curClusterItems.length ? { clusters: curClusterItems.join(',') } : {},
                  hisSeverity !== undefined ? { severity: hisSeverity } : {},
                  hisQueryContent ? { query: hisQueryContent } : {},
                  hisEventType !== undefined ? { is_recovered: hisEventType } : {},
                )
              }
              pageParams={{
                curPageName: 'p',
                pageSizeName: 'limit',
                pageSize: 30,
                pageSizeOptions: ['30', '100', '200', '500'],
              }}
              apiCallback={({ dat: { list: data, total } }) => ({
                data,
                total,
              })}
              columns={columns}
              reloadBtnType='btn'
              reloadBtnPos='left'
              filterType='flex'
              leftHeader={renderLeftHeader()}
            />
          ) : (
            <BlankBusinessPlaceholder text='历史告警' />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Event;
