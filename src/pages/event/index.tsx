import React, { useEffect, useMemo, useRef, useState } from 'react';
import PageLayout from '@/components/pageLayout';
import { AlertOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LeftTree from '@/components/LeftTree';
import DataTable from '@/components/Dantd/components/data-table';
import moment from 'moment';
import { Button, Input, message, Modal, Tag, Tooltip } from 'antd';
import DateRangePicker, { RelativeRange } from '@/components/DateRangePicker';
import { priorityColor } from '@/utils/constant';
import { useHistory } from 'react-router';
import './index.less';
import { deleteAlertEvents } from '@/services/warning';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/common';
import { eventStoreState } from '@/store/eventInterface';
import { CommonStoreState } from '@/store/commonInterface';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';

const { confirm } = Modal;

export function deleteAlertEventsModal(busiId, ids: number[], onSuccess = () => {}) {
  confirm({
    title: '删除告警事件',
    icon: <ExclamationCircleOutlined />,
    content: '通常只有在确定监控数据永远不再上报的情况下（比如调整了监控数据标签，或者机器下线）才删除告警事件，因为相关告警事件永远无法自动恢复了，您确定要这么做吗？',
    okText: '确认删除',
    maskClosable: true,
    okButtonProps: { danger: true },
    onOk() {
      return deleteAlertEvents(busiId, ids).then((res) => {
        message.success('删除成功');
        onSuccess();
      });
    },
    onCancel() {},
  });
}

const Event: React.FC = () => {
  const history = useHistory();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { busiGroups, curClusterItems } = useSelector<RootState, CommonStoreState>((state) => state.common);
  const { severity, hourRange, queryContent } = useSelector<RootState, eventStoreState>((state) => state.event);
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
  const tableRef = useRef({
    handleReload() {},
  });
  const isAddTagToQueryInput = useRef(false);
  const [curBusiId, setCurBusiId] = useState<number>(-1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

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
      title: t('规则标题'),
      dataIndex: 'rule_name',
      render(title, { id }) {
        return (
          <Button size='small' type='link' style={{ padding: 0 }} onClick={() => history.push(`/alert-cur-events/${curBusiId}/${id}`)}>
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
                  if (!queryContent.includes(item)) {
                    isAddTagToQueryInput.current = true;
                    saveData('queryContent', queryContent ? `${queryContent.trim()} ${item}` : item);
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
      width: 120,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('操作'),
      dataIndex: 'operate',
      width: 120,
      render(value, record) {
        return (
          <>
            <Button size='small' type='link'>
              屏蔽
            </Button>
            <Button
              size='small'
              type='link'
              danger
              onClick={() =>
                deleteAlertEventsModal(curBusiId, [record.id], () => {
                  setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.id));
                  tableRef.current.handleReload();
                  refreashAlertings();
                })
              }
            >
              删除
            </Button>
          </>
        );
      },
    },
  ];

  function saveData(prop, data) {
    dispatch({
      type: 'event/saveData',
      prop,
      data,
    });
  }

  function refreashAlertings() {
    dispatch({
      type: 'event/refreshAlertings',
      ids: busiGroups.map((busiItem) => busiItem.id),
    });
  }

  function renderLeftHeader() {
    return (
      <div className='table-operate-box'>
        <div className='left'>
          <DateRangePicker
            showRight={false}
            leftList={DateRangeItems}
            value={hourRange}
            onChange={(range: RelativeRange) => {
              if (range.num !== hourRange.num || range.unit !== hourRange.unit) {
                saveData('hourRange', range);
              }
            }}
          />
          <Input
            className='search-input'
            prefix={<SearchOutlined />}
            placeholder='模糊搜索规则和标签(多个关键词请用空格分隔)'
            value={queryContent}
            onChange={(e) => saveData('queryContent', e.target.value)}
            onPressEnter={(e) => tableRef.current.handleReload()}
          />
        </div>
        <div className='right'>
          <Button
            danger
            disabled={selectedRowKeys.length === 0}
            onClick={() =>
              deleteAlertEventsModal(curBusiId, selectedRowKeys, () => {
                setSelectedRowKeys([]);
                tableRef.current.handleReload();
                refreashAlertings();
              })
            }
          >
            批量删除
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (isAddTagToQueryInput.current) {
      tableRef.current.handleReload();
      isAddTagToQueryInput.current = false;
    }
  }, [queryContent]);

  useEffect(() => {
    tableRef.current.handleReload();
  }, [curClusterItems, severity, hourRange]);

  // 获取活跃告警数量
  useEffect(() => {
    const busiIds = busiGroups.map((busiItem) => busiItem.id);
    if (busiIds.length) {
      dispatch({
        type: 'event/refreshAlertings',
        ids: busiIds,
      });
    }
  }, [busiGroups]);

  return (
    <PageLayout icon={<AlertOutlined />} title={t('活跃告警')} hideCluster>
      <div className='event-content'>
        <LeftTree
          clusterGroup={{
            isShow: true,
          }}
          busiGroup={{
            showAlertings: true,
            onChange(value) {
              setCurBusiId(typeof value === 'number' ? value : -1);
            },
          }}
          eventLevelGroup={{
            isShow: true,
            defaultSelect: severity,
            onChange(v: number | undefined) {
              saveData('severity', v);
            },
          }}
        />
        <div className='table-area'>
          {curBusiId !== -1 ? (
            <DataTable
              ref={tableRef}
              antProps={{
                rowKey: 'id',
                rowSelection: {
                  selectedRowKeys: selectedRowKeys,
                  onChange(selectedRowKeys, selectedRows) {
                    setSelectedRowKeys(selectedRowKeys.map((key) => Number(key)));
                  },
                },
                scroll: { x: 800, y: 'calc(100vh - 252px)' },
              }}
              url={`/api/n9e/busi-group/${curBusiId}/alert-cur-events`}
              customQueryCallback={(data) =>
                Object.assign(
                  data,
                  { hours: hourRange.unit !== 'hours' ? hourRange.num * 24 : hourRange.num },
                  curClusterItems.length ? { clusters: curClusterItems.join(',') } : {},
                  severity ? { severity } : {},
                  queryContent ? { query: queryContent } : {},
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
            <BlankBusinessPlaceholder text='活跃告警' />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Event;
