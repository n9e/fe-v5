import React, { useEffect, useMemo, useRef, useState } from 'react';
import PageLayout from '@/components/pageLayout';
import { AlertOutlined, ExclamationCircleOutlined, SearchOutlined, DownOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LeftTree from '@/components/LeftTree';
import DataTable from '@/components/Dantd/components/data-table';
import moment from 'moment';
import { Button, Input, message, Modal, Tag, Tooltip, Menu, Dropdown, Radio } from 'antd';
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
import { useInterval } from 'ahooks';
const { confirm } = Modal;
import ColumnSelect from '@/components/ColumnSelect';
import RefreshIcon from '@/components/RefreshIcon';

export const SeverityColor = ['red', 'orange', 'yellow', 'green'];

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
  const [severity, setSeverity] = useState<number>();
  const [curClusterItems, setCurClusterItems] = useState<string[]>([]);
  const { hourRange, queryContent } = useSelector<RootState, eventStoreState>((state) => state.event);
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
  const [interval, setInterval] = useState<number>(0);

  useInterval(
    () => {
      tableRef.current.handleReload();
    },
    interval > 0 ? interval * 1000 : undefined,
  );

  const columns = [
    {
      title: t('集群'),
      dataIndex: 'cluster',
      width: 120,
    },
    {
      title: t('规则标题&事件标签'),
      dataIndex: 'rule_name',
      render(title, { id, tags }) {
        const content =
          tags &&
          tags.map((item) => (
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
          <>
            <div>
              <a style={{ padding: 0 }} onClick={() => history.push(`/alert-cur-events/${id}`)}>
                {title}
              </a>
            </div>
            <div>
              <span className='event-tags'>{content}</span>
            </div>
          </>
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
            <Button
              size='small'
              type='link'
              onClick={() => {
                history.push('/alert-mutes/add', {
                  tags: record.tags.map((tag) => {
                    const [key, value] = tag.split('=');
                    return {
                      func: '==',
                      key,
                      value,
                    };
                  }),
                });
              }}
            >
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

  function renderLeftHeader() {
    const intervalItems: RelativeRange[] = [
      { num: 0, unit: 'second', description: 'off' },
      { num: 5, unit: 'seconds', description: 's' },
      { num: 30, unit: 'seconds', description: 's' },
      { num: 60, unit: 'seconds', description: 's' },
    ];

    const menu = (
      <Menu
        onClick={(e) => {
          setInterval(e.key as number);
        }}
      >
        {intervalItems.map(({ num, description }) => (
          <Menu.Item key={num}>
            {num > 0 && <span className='num'>{num}</span>}
            {description}
          </Menu.Item>
        ))}
      </Menu>
    );
    return (
      <div className='table-operate-box'>
        <div className='left'>
          <Dropdown overlay={menu}>
            <Button className='interval-btn' icon={<DownOutlined />}>
              {interval > 0 ? interval + 's' : 'off'}
            </Button>
          </Dropdown>
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
          <ColumnSelect
            onSeverityChange={(e) => setSeverity(e)}
            onBusiGroupChange={(e) => setCurBusiId(typeof e === 'number' ? e : -1)}
            onClusterChange={(e) => setCurClusterItems(e)}
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
  }, [curClusterItems, severity, hourRange, curBusiId]);

  return (
    <PageLayout icon={<AlertOutlined />} title={t('活跃告警')} hideCluster>
      <div className='event-content cur-events'>
        <div className='table-area'>
          <DataTable
            ref={tableRef}
            antProps={{
              rowKey: 'id',
              rowClassName: (record: { severity: number }, index) => {
                return SeverityColor[record.severity - 1];
              },
              rowSelection: {
                selectedRowKeys: selectedRowKeys,
                onChange(selectedRowKeys, selectedRows) {
                  setSelectedRowKeys(selectedRowKeys.map((key) => Number(key)));
                },
              },
              // scroll: { x: 'max-content' },
            }}
            url={`/api/n9e/alert-cur-events/list`}
            customQueryCallback={(data) =>
              Object.assign(
                data,
                { hours: hourRange.unit !== 'hours' ? hourRange.num * 24 : hourRange.num },
                curClusterItems.length ? { clusters: curClusterItems.join(',') } : {},
                severity ? { severity } : {},
                queryContent ? { query: queryContent } : {},
                { bgid: curBusiId },
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
        </div>
      </div>
    </PageLayout>
  );
};

export default Event;
