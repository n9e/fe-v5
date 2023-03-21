import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { message, Table, Modal, Button, Space, Popconfirm, Tooltip, Input } from 'antd';
import Rename from '../../TimeSeriesSource/Rename';
import { CheckCircleFilled, MenuOutlined } from '@ant-design/icons';
import { deleteDataSourceById, getDataSourceList, updateDataSourceStatus } from '@/components/DataSource/TimeSeriesSource/services';
import { arrayMoveImmutable } from 'array-move';
import type { SortableContainerProps, SortEnd } from 'react-sortable-hoc';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { kafkaOffsetReset, setDatasourceDefault } from '@/components/DataSource/LogSource/services';
import LogPopover from '../LogPopover';
// import { ESsourceType, IDefaultES } from '@/Packages/Settings/pages/LogSource';
import { useTranslation } from 'react-i18next';
export interface IDefaultES {
  default_id: number;
  system_id: number;
}
export const ESsourceType = ['elasticsearch', 'tencent-es', 'aliyun-es'];
export interface IPropsType {
  pluginList?: {
    name: string;
    type: string;
    logo?: any;
  }[];
  category?: string; // TODO: n9e 暂时是获取所有的数据源
  nameClick: (val) => void;
  isDrag?: boolean;
  logName?: string;
  defaultES?: IDefaultES;
  setDefaultES?: (val: IDefaultES) => void;
}
export interface IKeyValue {
  [key: string]: string | boolean | undefined;
}
const DragHandle = SortableHandle(() => (
  <MenuOutlined
    style={{
      cursor: 'grab',
      color: '#999',
    }}
  />
));
const SortableItem = SortableElement((props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />);
const SortableBody = SortableContainer((props) => <tbody {...props} />);
const TableSource = (props: IPropsType) => {
  const { t } = useTranslation();
  const { nameClick, category, pluginList, isDrag = false, logName, defaultES, setDefaultES } = props;
  const [tableData, setTableData] = useState<any>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataTotal, setDataTotal] = useState<number>(0);
  const [tableFilters, setTableFilters] = useState<IKeyValue>({});
  const [tableSort, setTableSort] = useState<IKeyValue>({});
  const [pageObj, setPageObj] = useState({
    current: 1,
    pageSize: 10,
  });
  useEffect(() => {
    init(logName);
  }, [pageObj, tableFilters, tableSort, refresh]);
  const init = (searchName?: string) => {
    setLoading(true);
    getDataSourceList({
      p: pageObj.current,
      limit: pageObj.pageSize,
      category,
      orderby: category === 'tracing' ? 'updated_at' : undefined,
      // 默认根据更新时间排序
      name: searchName ? searchName : undefined,
      ...tableFilters,
      ...tableSort,
    })
      .then((res) => {
        if (defaultES?.default_id) {
          res.items.forEach((el) => {
            el.defaultSource = el.id === defaultES?.default_id;
          });
        }
        setTableData(res.items || []);
        setDataTotal(res.total);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const onSearch = (value: string, e) => {
    e.stopPropagation();
    init(value);
  };
  const defaultColumns = [
    {
      title: ({ sortOrder, sortColumn, filters }) => {
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignContent: 'center',
            }}
          >
            <Tooltip placement='top' title={!sortOrder ? t('点击升序') : sortOrder === 'ascend' ? t('点击降序') : t('取消排序')}>
              <div
                style={{
                  lineHeight: '24px',
                  flex: '1',
                }}
              >
                {t('数据源名称')}
              </div>
            </Tooltip>

            <Input.Search
              size='small'
              defaultValue={logName}
              placeholder={t('请输入要查询的名称')}
              allowClear
              onSearch={onSearch}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 170,
              }}
            />
          </div>
        );
      },
      dataIndex: 'name',
      sorter: true,
      showSorterTooltip: false,
      render: (text, record) => {
        return (
          <Rename
            values={record}
            text={text}
            callback={() => {
              setRefresh((oldVal) => !oldVal);
            }}
          >
            <a
              onClick={() => {
                nameClick(record);
              }}
            >
              {
                <>
                  {text}
                  {record.defaultSource && (
                    <Tooltip placement='top' title={t('该ES集群为日志分析的默认集群')}>
                      <CheckCircleFilled
                        style={{
                          visibility: 'visible',
                        }}
                      />
                    </Tooltip>
                  )}
                </>
              }
            </a>
          </Rename>
        );
      },
    },
    {
      title: t('状态'),
      width: 300,
      dataIndex: 'status',
      sorter: true,
      filters: [
        {
          text: t('启用中'),
          value: 'enabled',
        },
        {
          text: t('停用中'),
          value: 'disabled',
        },
      ],
      render: (text) => {
        return text === 'enabled' ? <span className='theme-color'>{t('启用中')}</span> : <span className='second-color'>{t('停用中')}</span>;
      },
    },
    {
      title: t('数据类型'),
      width: 300,
      dataIndex: 'plugin_type_name',
      sorter: true,
      filters: pluginList?.map((el) => {
        let temp = {
          text: el.name,
          value: el.type,
        };
        return temp;
      }),
    },
    {
      title: t('操作'),
      width: 300,
      render: (record) => {
        return (
          <Space>
            <Popconfirm
              placement='topLeft'
              title={`${t('是否确定')}${record.status === 'enabled' ? t('停用') : t('启用')}?${record.name}`}
              onConfirm={() => {
                updateDataSourceStatus({
                  id: record.id,
                  status: record.status === 'enabled' ? 'disabled' : 'enabled',
                }).then((res) => {
                  message.success(record.status === 'enabled' ? t('停用成功') : t('启用成功'));
                  setRefresh((oldVal) => !oldVal);
                });
              }}
            >
              <Button type='link' size='small'>
                {record.status === 'enabled' ? t('停用') : t('启用')}
              </Button>
            </Popconfirm>

            {record.status === 'disabled' && (
              <Button
                type='link'
                size='small'
                danger
                onClick={() => {
                  Modal.confirm({
                    title: `${t('确定删除')}${record.name}${t('数据源吗?')}`,
                    okText: t('确认'),
                    cancelText: t('取消'),
                    onOk() {
                      deleteDataSourceById(record.id).then(() => {
                        message.success(t('删除数据源成功'));
                        setRefresh((oldVal) => !oldVal);
                      });
                    },
                  });
                }}
              >
                {t('删除')}
              </Button>
            )}
            {category === 'logging' && ESsourceType.includes(record.plugin_type.split('.')?.[0]) && (
              <>
                <Popconfirm
                  placement='topLeft'
                  title={t('是否把该ES集群设置为日志分析的默认集群?')}
                  onConfirm={() => {
                    setLoading(true);
                    setDatasourceDefault({
                      id: record.id,
                    }).then((res) => {
                      res === 'ok' && message.success(t('设置默认ES集群成功'));
                      defaultES &&
                        setDefaultES &&
                        setDefaultES({
                          ...defaultES,
                          default_id: record.id,
                        });
                      setTableData((oldVal) => {
                        oldVal.forEach((el) => {
                          el.defaultSource = el.id === record.id;
                        });
                        return oldVal;
                      });
                      setLoading(false);
                    });
                  }}
                  disabled={record.defaultSource}
                >
                  <Button type='link' size='small' disabled={record.defaultSource}>
                    {t('设为默认')}
                  </Button>
                </Popconfirm>
              </>
            )}

            {category === 'logging' && record.plugin_type_name === 'kafka' && (
              <>
                <LogPopover logSourceId={record.id} />
                <Popconfirm
                  placement='topLeft'
                  title={t('请确认所有使用该数据源的下游均可接收重置, 是否继续重置?')}
                  onConfirm={() => {
                    kafkaOffsetReset({
                      id: record.id,
                    }).then((res) => {
                      message.success(t('重置数据源成功'));
                    });
                  }}
                  disabled={record.status === 'enabled'}
                >
                  <Tooltip title={record.status === 'enabled' ? t('需先停用数据源, 待后端消费者停掉以后才能执行重置, 且重置后所有使用该数据源的下游都会收到影响') : ''}>
                    <Button type='link' size='small' disabled={record.status === 'enabled'}>
                      {t('重置offset')}
                    </Button>
                  </Tooltip>
                </Popconfirm>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  // 拖拽
  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(tableData.slice(), oldIndex, newIndex).filter((el) => !!el);
      console.log('Sorted items: ', newData);
      setTableData(newData);
    }
  };
  const DraggableContainer = React.memo((props) => <SortableBody useDragHandle disableAutoscroll helperClass='row-dragging' onSortEnd={onSortEnd} {...props} />);
  const DraggableBodyRow = React.memo(({ className, style, ...restProps }: any) => {
    const index = tableData.findIndex((x) => x.id === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  });
  const handleTableChange = (pagination, filters, sorter, { action }) => {
    if (action === 'paginate') {
      setPageObj({
        current: pagination.current,
        pageSize: pagination.pageSize,
      });
    }
    if (action === 'filter') {
      const filtersFormat: IKeyValue = {};
      for (const key in filters) {
        if (Object.prototype.hasOwnProperty.call(filters, key)) {
          if (key === 'plugin_type_name') {
            filtersFormat.plugin_type = filters[key]?.join();
          } else {
            filtersFormat[key] = filters[key]?.join();
          }
        }
      }
      setTableFilters({
        ...filtersFormat,
      });
    }
    if (action === 'sort') {
      setTableSort(
        sorter.order
          ? {
              orderby: sorter.field === 'plugin_type_name' ? 'plugin_type' : sorter.field,
              asc: sorter.order === 'ascend',
            }
          : {},
      );
    }
  };
  return (
    <Table
      size='small'
      className='datasource-list'
      rowKey='id'
      dataSource={tableData}
      columns={defaultColumns}
      loading={loading}
      onChange={handleTableChange}
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
        },
      }}
      pagination={{
        current: pageObj.current,
        pageSize: pageObj.pageSize,
        total: dataTotal,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (total) => `${t('总共 ')}${total}${t(' 条')}`,
      }}
    />
  );
};
export default TableSource;
