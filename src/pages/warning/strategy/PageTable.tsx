import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import {
  Tag,
  Button,
  Select,
  Modal,
  message,
  Switch,
  Dropdown,
  Table
} from 'antd';
import {
  getStrategyGroupSubList,
  updateAlertRules
} from '@/services/warning';
import SearchInput from '@/components/BaseSearchInput';
import { useHistory } from 'react-router-dom';

import {
  strategyItem,
  strategyStatus,
} from '@/store/warningInterface';
import { CommonStoreState } from '@/store/commonInterface';
import { addOrEditStrategy, deleteStrategy } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import { ColumnType } from 'antd/lib/table';
import { pageSizeOptionsDefault } from '../const';
import dayjs from 'dayjs';
import { RootState } from '@/store/common';
import RefreshIcon from '@/components/RefreshIcon';
import ColorTag from '@/components/ColorTag';
import {
  DownOutlined,
} from '@ant-design/icons';
import ImportAndDownloadModal, {
  ModalStatus,
} from '@/components/ImportAndDownloadModal';
import EditModal from './components/editModal';
const { Option } = Select;
const { confirm } = Modal;

const exportIgnoreAttrs = [
  'cluster',
  'create_by',
  'group_id',
  'id',
  'notify_groups_obj',
  'notify_groups',
  'notify_users',
  'create_at',
  'update_at',
  'update_by',
];
import { useTranslation } from 'react-i18next';
const exportIgnoreAttrsObj = Object.fromEntries(
  exportIgnoreAttrs.map((item) => [item, undefined]),
);

interface Props {
  bgid?: number;
  clusters?: string[];
}

const PageTable: React.FC<Props> = ({
  bgid,
  clusters
}) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const [modalType, setModalType] = useState<ModalStatus>(ModalStatus.None);
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<strategyItem[]>([]);
  const [exportData, setExportData] = useState<string>('');
  const { curBusiItem } = useSelector<RootState, CommonStoreState>(state => state.common);

  const [query, setQuery] = useState<string>('');
  const [isModalVisible, setisModalVisible] = useState<boolean>(false);

  const [currentStrategyDataAll, setCurrentStrategyDataAll] = useState([]);
  const [currentStrategyData, setCurrentStrategyData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bgid) {
      getAlertRules();
    }
  }, [bgid]);

  useEffect(() => {
    filterData();
  }, [query, clusters, currentStrategyDataAll])

  const getAlertRules = async () => {
    if (!bgid) {
      return;
    }
    setLoading(true);
    const { success, dat } = await getStrategyGroupSubList({id: bgid});
    if (success) {
      setCurrentStrategyDataAll(dat || []);
      setLoading(false);
    }
     
  }

  const filterData = () => {
    const data = JSON.parse(JSON.stringify(currentStrategyDataAll));
    const res = data.filter(item => {
      return item.name.indexOf(query) > -1 || item.append_tags.join(' ').indexOf(query) > -1 || clusters && clusters?.indexOf(item.cluster) > -1
    });
    setCurrentStrategyData(res || []);
  }

  const goToAddWarningStrategy = () => {
    curBusiItem?.id && history.push(`/strategy/add/${curBusiItem.id}`);
  };

  const handleClickEdit = (id, isClone = false) => {
    curBusiItem?.id &&
      history.push(`/strategy/edit/${id}${isClone ? '?mode=clone' : ''}`);
  };

  const refreshList = () => {
    getAlertRules();
  };

  
  const columns: ColumnType<strategyItem>[] = [
    {
      title: t('集群'),
      dataIndex: 'cluster',
      render: (data) => {
        return <div>{data}</div>;
      },
    },
    {
      title: t('级别'),
      dataIndex: 'severity',
      render: (data) => {
        return <Tag color={priorityColor[data - 1]}>S{data}</Tag>;
      },
    },
    {
      title: t('名称'),
      dataIndex: 'name',
      render: (data, record) => {
        return (
          <div
            className='table-active-text'
            onClick={() => {
              handleClickEdit(record.id);
            }}
          >
            {data}
          </div>
        );
      },
    },
    {
      title: t('告警接收者'),
      dataIndex: 'notify_groups_obj',
      render: (data, record) => {
        
        return (
          (data.length &&
            data.map(
              (
                user: {
                  nickname: string;
                  username: string;
                } & { name: string },
                index: number,
              ) => {
                return (
                  <ColorTag
                    text={user.nickname || user.username || user.name}
                    key={index}
                  ></ColorTag>
                );
              },
            )) || <div></div>
        );
      },
    },
    {
      title: t('附加标签'),
      dataIndex: 'append_tags',
      render: (data) => {
        const array = data || [];
        return (
          (array.length &&
            array.map((tag: string, index: number) => {
              return <ColorTag text={tag} key={index}></ColorTag>;
            })) || <div></div>
        );
      },
    },
    {
      title: t('更新时间'),
      dataIndex: 'update_at',
      render: (text: string) =>
        dayjs(Number(text) * 1000).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('启用'),
      dataIndex: 'disabled',
      render: (disabled, record) => (
        <Switch
          checked={disabled === strategyStatus.Enable}
          size='small'
          onChange={() => {
            const { id, disabled } = record;
            updateAlertRules({
              ids: [id],
              fields: {
                disabled: !disabled ? 1 : 0
              }
            }, curBusiItem.id
            ).then(() => {
              refreshList();
            });
          }}
        />
      ),
    },
    {
      title: t('操作'),
      dataIndex: 'operator',
      fixed: 'right',
      width: 100,
      render: (data, record) => {
        return (
          <div className='table-operator-area'>
            <div
              className='table-operator-area-normal'
              onClick={() => {
                handleClickEdit(record.id, true);
              }}
            >
              {t('克隆')}
            </div>
            <div
              className='table-operator-area-warning'
              onClick={() => {
                confirm({
                  title: t('是否删除该告警规则?'),
                  onOk: () => {
                    deleteStrategy([record.id], curBusiItem.id).then(() => {
                      message.success(t('删除成功'));
                      refreshList();
                    });
                  },

                  onCancel() {},
                });
              }}
            >
              {t('删除')}
            </div>
          </div>
        );
      },
    },
  ];
  
  const toOneArr = (arr, res, name) => {
    arr.forEach((ele) => {
      if (Array.isArray(ele)) {
        toOneArr(ele, res, name);
      } else {
        res.push(ele[name]);
      }
    });
  };
  const openModel = (title, item) => {
    if (selectRowKeys.length == 0) {
      message.warning(t('请先选择策略'));
      return;
    }
    setisModalVisible(true);
  };
  
  const menu = useMemo(() => {
    return (
      <ul className='ant-dropdown-menu'>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => setModalType(ModalStatus.Import)}
        >
          <span>{t('导入告警规则')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectedRows.length) {
              const exportData = selectedRows.map((item) => {
                return { ...item, ...exportIgnoreAttrsObj };
              });
              setExportData(JSON.stringify(exportData, null, 2));
              setModalType(ModalStatus.Export);
            } else {
              message.warning(t('未选择任何规则'));
            }
          }}
        >
          <span>{t('导出告警规则')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectRowKeys.length) {
              confirm({
                title: t('是否批量删除告警规则?'),
                onOk: () => {
                  deleteStrategy(
                    selectRowKeys as number[],
                    curBusiItem?.id,
                  ).then(() => {
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
          <span>{t('批量删除规则')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            openModel(t('批量更新规则'), 1);
          }}
        >
          <span>{t('批量更新规则')}</span>
        </li>
        
      </ul>
    );
  }, [selectRowKeys, t]);

  const handleImportStrategy = async (data) => {
    const { dat } = await addOrEditStrategy(data, curBusiItem.id, 'Post');
    return dat || {};
  };

  const editModalFinish = async (isOk, fieldsData?) => {
    if (isOk) {
      const res = await updateAlertRules({
        ids: selectRowKeys,
        fields: fieldsData
      }, curBusiItem.id)
      if (!res.err) {
        message.success('修改成功！');
        refreshList();
        setisModalVisible(false);
      } else {
        message.error(res.err);
      }
      
    } else {
      setisModalVisible(false);
    }
  }

  return (
    <div className='strategy-table-content'>
      
      <div className='strategy-table-search table-handle'>
        <div className='strategy-table-search-left'>
          <RefreshIcon
            className='strategy-table-search-left-refresh'
            onClick={() => {
              refreshList();
            }}
          />
          <SearchInput
            className={'searchInput'}
            placeholder={t('搜索名称或标签')}
            onSearch={setQuery}
            allowClear
          />
        </div>
        <div className='strategy-table-search-right'>
          
          <Button
            type='primary'
            onClick={goToAddWarningStrategy}
            className='strategy-table-search-right-create'
          >
            {t('新增告警策略')}
          </Button>
          <div className={'table-more-options'}>
            
            <Dropdown overlay={menu} trigger={['click']}>
              <Button onClick={(e) => e.stopPropagation()}>
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
      
      <Table
        rowKey="id"
        // sticky
        pagination={{
          total: currentStrategyData.length,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) => {
            return `共 ${total} 条数据`;
          },
          pageSizeOptions: pageSizeOptionsDefault,
          defaultPageSize: 30
        }}
        loading={loading}
        dataSource={currentStrategyData}
        rowSelection={{
          selectedRowKeys: selectedRows.map(item => item.id),
          onChange: (
            selectedRowKeys: React.Key[],
            selectedRows: strategyItem[],
          ) => {
            setSelectRowKeys(selectedRowKeys);
            console.log(selectedRowKeys, 'selectedRowKeys');
            setSelectedRows(selectedRows);
          },
        }}
        columns={columns}
      />
      <ImportAndDownloadModal
        status={modalType}
        onClose={() => {
          setModalType(ModalStatus.None);
          getAlertRules();
        }}
        onSubmit={handleImportStrategy}
        title={t('策略')}
        exportData={exportData}
      />
      {isModalVisible && <EditModal isModalVisible={isModalVisible} editModalFinish={editModalFinish}/>}
      
    </div>
  );
};

export default PageTable;
