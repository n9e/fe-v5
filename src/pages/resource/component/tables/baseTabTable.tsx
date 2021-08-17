import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  useMemo,
} from 'react';
import SearchInput from '@/components/BaseSearchInput';
import { IFormButtonModalProps } from '@/components/BaseModal/formButtonModal';
import { Dropdown, message, Modal, Button } from 'antd';
import FormButton from '@/components/BaseModal/formButtonModal';
import BaseTable, { IBaseTableProps } from '@/components/BaseTable';
import { baseTableProps, resourceStoreState } from '@/store/businessInterface';
import { IBasePagingParams, basePagingReq, RootState } from '@/store/common';
import { ColumnType } from 'antd/lib/table';
import { DownOutlined } from '@ant-design/icons';
import FormButtonModal from '@/components/BaseModal/formButtonModal';
import { getMoreTypeModal } from '@/pages/resource/component/ImportAndExportModal';
import { cloneResourceModal } from '@/pages/resource/component/constant';
import { useSelector } from 'react-redux';
import { deleteCollectSetting } from '@/services';
import { getResourceGroups } from '@/services/resource';
import { useTranslation } from 'react-i18next';
const { confirm } = Modal;
export interface IBaseTabTableProps<RecordType> extends baseTableProps {
  createModalProps: IFormButtonModalProps;
  searchPlaceHolder?: string;
  fetchHandle: (data: IBasePagingParams) => Promise<basePagingReq<RecordType>>;
  columns: ColumnType<RecordType>[];
}
type refType = {
  refreshList: () => {};
} | null;
type refFunction<T = any> = React.ForwardRefRenderFunction<
  refType,
  IBaseTabTableProps<T>
>;

const BaseTabTable: refFunction = function <RecordType>(
  {
    activeKey,
    currentKey,
    createModalProps,
    searchPlaceHolder,
    fetchHandle,
    columns,
  },
  refCurrent: any,
) {
  const { currentGroup, prefix } = useSelector<RootState, resourceStoreState>(
    (state) => state.resource,
  );
  const { t } = useTranslation();
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [selectRows, setSelectRows] = useState<any[]>([]);
  const [query, setQuery] = useState<string>('');
  const [init, setInit] = useState<boolean>(false);
  const ref = useRef(null);
  useEffect(() => {
    if (activeKey === currentKey && !init && currentGroup?.id) {
      setInit(true);
    }
  }, [activeKey, currentKey, init, currentGroup]);
  useEffect(() => {
    if (init) {
      refreshList(); //前端分页,所以修改prefix 手动触发刷新
    }
  }, [prefix]);
  useEffect(() => {
    setSelectRowKeys([]);
  }, [currentGroup?.id]);

  const handleSearch = (keyword: string) => {
    setQuery(keyword);
  };

  const refreshList = () => {
    (ref.current as any).refreshList();
  };

  useImperativeHandle(refCurrent, () => ({
    refreshList,
  }));
  const [resourceList, setResourceList] = useState<any[]>([]);
  useEffect(() => {
    getResourceGroups().then((res) => {
      setResourceList(res.dat.list);
    });
  }, [JSON.stringify(selectRowKeys)]);
  const getTableProps: () => IBaseTableProps<RecordType> = useCallback(() => {
    return {
      fetchParams: {
        id: currentGroup?.id || '',
        query: query,
        prefix,
      },
      fetchHandle,
      autoFetch: false,
      initFetch: init,
      feQueryParams: ['name', 'note', 'data.port', 'data.param'],
      columns,
      rowKey: 'id',
      pageSize: 10,
      fePaging: true,
      rowSelection: {
        selectedRowKeys: selectRowKeys,
        selectedRows: selectRows,
        onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
          setSelectRowKeys(selectedRowKeys);
          setSelectRows(selectedRows);
        },
      },
    };
  }, [currentGroup?.id, init, selectRowKeys, query, prefix]);
  const menu = useMemo(() => {
    return (
      <ul className='ant-dropdown-menu'>
        <li className='ant-dropdown-menu-item'>
          <FormButtonModal
            {...getMoreTypeModal(
              'import',
              t,
              JSON.stringify(selectRows, null, 2),
              refreshList,
              currentGroup?.id,
            )}
          ></FormButtonModal>
        </li>
        <li className='ant-dropdown-menu-item'>
          {selectRowKeys.length ? (
            <FormButtonModal
              {...getMoreTypeModal(
                'export',
                t,
                JSON.stringify(selectRows, null, 2),
              )}
            ></FormButtonModal>
          ) : (
            <div
              onClick={() => {
                message.warning(t('未选择任何规则'));
              }}
            >
              {t('导出规则')}
            </div>
          )}
        </li>
        <li className='ant-dropdown-menu-item'>
          {selectRowKeys.length ? (
            <FormButtonModal
              {...cloneResourceModal(selectRows, resourceList, t)}
            ></FormButtonModal>
          ) : (
            <div
              onClick={() => {
                message.warning(t('未选择任何规则'));
              }}
            >
              {t('克隆到其他资源分组')}
            </div>
          )}
          {/* <div onClick={() => {}}>克隆到其他资源分组</div> */}
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectRowKeys.length) {
              confirm({
                title: t('是否批量删除规则?'),
                onOk: () => {
                  deleteCollectSetting(selectRowKeys as number[]).then(() => {
                    message.success(t('删除成功'));
                    refreshList();
                  });
                },

                onCancel() {},
              });
            } else {
              message.warning(t('未选择任何规则'));
            }
          }}
        >
          <span>{t('删除')}</span>
        </li>
      </ul>
    );
  }, [selectRowKeys]);
  return (
    <div>
      <div className='table-search-area'>
        <SearchInput
          style={{
            width: '400px',
          }}
          placeholder={searchPlaceHolder}
          onSearch={handleSearch}
        ></SearchInput>
        <div className={'table-search-area-right'}>
          {createModalProps ? (
            <FormButton {...createModalProps}></FormButton>
          ) : null}
          <div className={'table-more-options'}>
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
      </div>
      <BaseTable ref={ref} {...getTableProps()}></BaseTable>
    </div>
  );
};

export default React.forwardRef(BaseTabTable);
