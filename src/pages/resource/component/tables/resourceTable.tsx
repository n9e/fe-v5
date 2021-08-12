import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { Select, Dropdown, Modal, Tag, Button, Tooltip, message } from 'antd';
import FormButton from '@/components/BaseModal/formButtonModal';
import SearchInput from '@/components/BaseSearchInput';
import FormButtonModal from '@/components/BaseModal/formButtonModal';
import { getResourceList, deleteResourceItem } from '@/services/resource';
import {
  resourceItem,
  baseTableProps,
  resourceStoreState,
} from '@/store/businessInterface';
import {
  CopyOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { BaseDrawer } from '@/components/BaseDrawer';
import { ColumnsType } from 'antd/lib/table';
import BaseTable, { IBaseTableProps } from '@/components/BaseTable';
import { useDispatch, useSelector } from 'react-redux';
import {
  getResourceDetailDrawerProps,
  getRangeDatePickerModal,
  createAddResourceModal,
  batchUpdateRemarkModal,
  batchUpdateTagsModal,
} from '../constant';
import { RootState } from '@/store/common';
import { copyToClipBoard } from '@/utils';
import { useTranslation } from 'react-i18next';
const { Option } = Select;
const { confirm } = Modal;
interface ITableProps extends baseTableProps {}

const ResourceTable: React.FC<ITableProps> = ({ activeKey, currentKey }) => {
  const [init, setInit] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [selectRows, setSelectRows] = useState<resourceItem[]>([]);
  const [query, setQuery] = useState<string>('');
  const [copyValStr, setCopyVal] = useState<string>('');
  const [ids, setIds] = useState<number[]>([]);
  const { t } = useTranslation();
  const ref = useRef(null);
  const {
    group: { common },
    resourceData: { resourceDetail },
    currentGroup,
    prefix,
  } = useSelector<RootState, resourceStoreState>((state) => state.resource);
  useEffect(() => {
    if (activeKey === currentKey && !init && currentGroup?.id) {
      setInit(true);
    }
  }, [activeKey, currentKey, init, currentGroup]);
  useEffect(() => {
    setSelectRowKeys([]);
    setSelectRows([]);
  }, [currentGroup?.id]);
  const columns: ColumnsType<resourceItem> = [
    {
      title: (
        <div>
          {t('资源标识')} 
          <Tooltip placement='top' title={t('复制已选项')}>
            <CopyOutlined
              onClick={() => {
                if (copyValStr === '') {
                  message.warning(t('请先选择资源标识'));
                } else {
                  copyToClipBoard(copyValStr);
                }
              }}
            />
          </Tooltip>
        </div>
      ),
      dataIndex: 'ident',
      filterIcon: 'copy',
      render: (data, record: resourceItem) => {
        const drawerProps = getResourceDetailDrawerProps(
          {
            record,
            dispatch,
            ref,
          },
          t,
        );
        return (
          <div>
            <BaseDrawer {...drawerProps}></BaseDrawer>
          </div>
        );
      },
    },
    {
      title: t('资源名称'),
      dataIndex: 'alias',
    },
    {
      title: t('标签'),
      dataIndex: 'tags',
      ellipsis: true,
      render: (data, record) => {
        return (
          <span>
            {record.tags
              ? record.tags.split(' ').map((item) => (
                  <Tag key={item} color='blue'>
                    {item}
                  </Tag>
                ))
              : ''}
          </span>
        );
      },
    },
    {
      title: t('备注'),
      dataIndex: 'note',
      ellipsis: true,
      render: (data, record) => {
        return <span>{record.note || ''}</span>;
      },
    },
    {
      title: t('操作'),
      dataIndex: 'operator',
      width: 200,
      render: (data, record) => (
        <div className='table-operator-area'>
          <FormButtonModal
            {...getRangeDatePickerModal(
              {
                etime: record.mute_etime,
                btime: record.mute_btime,
              },
              [record.id],
              () => {
                (ref?.current as any)?.refreshList();
              },
              t,
            )}
          ></FormButtonModal>
          <div
            className='table-operator-area-warning'
            onClick={() => {
              if (currentGroup?.id) {
                confirm({
                  title: t('是否移除该资源?'),
                  icon: <ExclamationCircleOutlined />,
                  onOk: () => {
                    deleteResourceItem(currentGroup?.id, [record.ident]).then(
                      () => {
                        (ref?.current as any)?.refreshList();
                      },
                    );
                  },

                  onCancel() {},
                });
              }
            }}
          >
            {t('移除')}
          </div>
        </div>
      ),
    },
  ];
  const getTableProps: () => IBaseTableProps<resourceItem> = useCallback(() => {
    return {
      fetchParams: {
        id: currentGroup?.id || '',
        query: query,
        prefix,
      },
      fetchHandle: getResourceList,
      autoFetch: false,
      initFetch: init,
      columns: columns,
      rowKey: 'ident',
      rowSelection: {
        selectedRowKeys: selectRowKeys,
        onChange: (
          selectedRowKeys: React.Key[],
          selectRows: resourceItem[],
        ) => {
          let ids = selectRows.map((ele) => {
            return ele.id;
          });
          setIds(ids);
          let copyArr: string[] = [];

          for (const val of selectRows) {
            copyArr.push(val.ident.trim());
          }

          let str = copyArr.join('\n').trim();
          setCopyVal(str);
          setSelectRowKeys(selectedRowKeys);
          setSelectRows(selectRows);
        },
      },
    };
  }, [currentGroup?.id, init, selectRowKeys, query, prefix, t]);

  const selectRowsTags = selectRows
    .map((item) => item.tags)
    .filter((item) => item);

  const menu = useMemo(() => {
    return (
      <ul className='ant-dropdown-menu'>
        <li className='ant-dropdown-menu-item'>
          {selectRowKeys.length ? (
            <FormButtonModal
              {...getRangeDatePickerModal(
                {
                  etime: 0,
                  btime: 0,
                },
                ids as number[],
                () => {
                  (ref?.current as any)?.refreshList();
                },
                t,
              )}
            ></FormButtonModal>
          ) : (
            <div
              onClick={() => {
                message.warning(t('您未选用任何资源'));
              }}
            >
              {t('屏蔽时间')}
            </div>
          )}
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectRowKeys.length) {
              confirm({
                title: t('是否移除该资源?'),
                icon: <ExclamationCircleOutlined />,
                onOk: () => {
                  if (currentGroup?.id) {
                    deleteResourceItem(
                      currentGroup?.id,
                      selectRows.map((item) => item.ident),
                    ).then(() => {
                      (ref?.current as any)?.refreshList();
                    });
                  }
                },

                onCancel() {},
              });
            } else {
              message.warning(t('您未选用任何资源'));
            }
          }}
        >
          <span>{t('移除')}</span>
        </li>
        <li className='ant-dropdown-menu-item'>
          {selectRowKeys.length ? (
            <FormButtonModal
              {...batchUpdateRemarkModal(
                ids as number[],
                () => {
                  (ref?.current as any)?.refreshList();
                },
                t,
              )}
            ></FormButtonModal>
          ) : (
            <div
              onClick={() => {
                message.warning(t('您未选用任何资源'));
              }}
            >
              {t('维护备注')}
            </div>
          )}
        </li>
        <li className='ant-dropdown-menu-item'>
          {selectRowKeys.length ? (
            <FormButtonModal
              {...batchUpdateTagsModal(
                selectRowsTags.length > 0
                  ? Array.from(new Set(selectRowsTags.join(' ').split(' ')))
                  : [],
                ids as number[],
                () => {
                  (ref?.current as any)?.refreshList();
                },
                t,
              )}
            ></FormButtonModal>
          ) : (
            <div
              onClick={() => {
                message.warning(t('您未选用任何资源'));
              }}
            >
              {t('维护标签')}
            </div>
          )}
        </li>
      </ul>
    );
  }, [selectRowKeys, ids, t]);

  const handleSearchResource = (keyword: string) => {
    setQuery(keyword);
  };

  return (
    <div>
      <div className='table-search-area'>
        <SearchInput
          style={{
            width: '400px',
          }}
          placeholder={t('资源信息或标签')}
          onSearch={handleSearchResource}
        ></SearchInput>
        <div className={'table-search-area-right'}>
          <FormButton
            {...createAddResourceModal(
              [currentGroup?.id || ''],
              () => {
                (ref?.current as any)?.refreshList();
              },
              t,
            )}
          ></FormButton>

          <Dropdown overlay={menu} trigger={['click']}>
            <Button
              onClick={(e) => e.stopPropagation()}
              style={{
                marginLeft: 8,
              }}
            >
              {t('更多操作')}
              <DownOutlined
                style={{
                  marginLeft: 2,
                }}
              />
            </Button>
          </Dropdown>
        </div>
      </div>
      <BaseTable ref={ref} {...getTableProps()}></BaseTable>
    </div>
  );
};

export default ResourceTable;
