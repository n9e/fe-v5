import React, { useEffect, useState, useMemo } from 'react';
import { Button, Modal, message, Dropdown, Table, Switch } from 'antd';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ColumnType } from 'antd/lib/table';
import dayjs from 'dayjs';
import RefreshIcon from '@/components/RefreshIcon';
import ColorTag from '@/components/ColorTag';
import { DownOutlined } from '@ant-design/icons';
import ImportAndDownloadModal, { ModalStatus } from '@/components/ImportAndDownloadModal';
import ColumnSelect from '@/components/ColumnSelect';
import { getRecordingRuleSubList, updateRecordingRules } from '@/services/recording';
import SearchInput from '@/components/BaseSearchInput';
import { RootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { strategyItem, strategyStatus } from '@/store/warningInterface';
import { addOrEditRecordingRule, deleteRecordingRule } from '@/services/recording';
import EditModal from './components/editModal';

interface Props {
  bgid?: number;
}

const { confirm } = Modal;
const pageSizeOptionsDefault = ['30', '50', '100', '300'];
const exportIgnoreAttrsObj = {
  id: undefined,
  group_id: undefined,
  cluster: undefined,
  create_at: undefined,
  create_by: undefined,
  update_at: undefined,
  update_by: undefined,
};

const PageTable: React.FC<Props> = ({ bgid }) => {
  const [severity] = useState<number>();
  const [clusters, setClusters] = useState<string[]>([]);
  const { t } = useTranslation();
  const history = useHistory();
  const [modalType, setModalType] = useState<ModalStatus>(ModalStatus.None);
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<strategyItem[]>([]);
  const [exportData, setExportData] = useState<string>('');
  const { curBusiItem } = useSelector<RootState, CommonStoreState>((state) => state.common);

  const [query, setQuery] = useState<string>('');
  const [isModalVisible, setisModalVisible] = useState<boolean>(false);

  const [currentStrategyDataAll, setCurrentStrategyDataAll] = useState([]);
  const [currentStrategyData, setCurrentStrategyData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRecordingRules();
  }, [bgid, severity]);

  useEffect(() => {
    filterData();
  }, [query, clusters, currentStrategyDataAll]);

  const getRecordingRules = async () => {
    if (!bgid) {
      return;
    }
    setLoading(true);
    const { success, dat } = await getRecordingRuleSubList(curBusiItem.id);
    if (success) {
      setCurrentStrategyDataAll(dat.filter((item) => !severity || item.severity === severity) || []);
      setLoading(false);
    }
  };
  const pareArray = (paArr, chArr) => {
    for (let i = 0; i < chArr.length; i++) {
      if (paArr.includes(chArr[i])) {
        return true;
      }
    }
    return false;
  };
  const filterData = () => {
    const data = JSON.parse(JSON.stringify(currentStrategyDataAll));
    const res = data.filter((item) => {
      const lowerCaseQuery = query.toLowerCase();
      return (
        (item.name.toLowerCase().indexOf(lowerCaseQuery) > -1 || item.append_tags.join(' ').toLowerCase().indexOf(lowerCaseQuery) > -1) &&
        ((clusters && pareArray(item.cluster, clusters)) || clusters?.length === 0)
      );
    });
    setCurrentStrategyData(res || []);
  };
  const goToAddWarningStrategy = () => {
    curBusiItem?.id && history.push(`/recording-rules/add/${curBusiItem.id}`);
  };

  const handleClickEdit = (id, isClone = false) => {
    curBusiItem?.id && history.push(`/recording-rules/edit/${id}${isClone ? '?mode=clone' : ''}`);
  };

  const refreshList = () => {
    getRecordingRules();
  };

  const columns: ColumnType<strategyItem>[] = [
    {
      title: t('集群'),
      dataIndex: 'cluster',
      render: (data) => {
        return <ColorTag text={data} key={data}></ColorTag>;
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
      title: t('计算周期'),
      dataIndex: 'prom_eval_interval',
      render: (data, record) => {
        return data + 's';
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
      render: (text: string) => dayjs(Number(text) * 1000).format('YYYY-MM-DD HH:mm:ss'),
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
            updateRecordingRules(
              {
                ids: [id],
                fields: {
                  disabled: !disabled ? 1 : 0,
                },
              },
              curBusiItem.id,
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
                  title: t('是否删除该记录规则?'),
                  onOk: () => {
                    deleteRecordingRule([record.id], curBusiItem.id).then(() => {
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
        <li className='ant-dropdown-menu-item' onClick={() => setModalType(ModalStatus.Import)}>
          <span>{t('导入记录规则')}</span>
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
          <span>{t('导出记录规则')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectRowKeys.length) {
              confirm({
                title: t('是否批量删除记录规则?'),
                onOk: () => {
                  deleteRecordingRule(selectRowKeys as number[], curBusiItem.id).then(() => {
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

  const handleImportStrategy = async (d) => {
    const { dat } = await addOrEditRecordingRule(d, curBusiItem.id, 'Post');
    return dat || {};
  };

  const editModalFinish = async (isOk, fieldsData?) => {
    if (isOk) {
      const res = await updateRecordingRules(
        {
          ids: selectRowKeys,
          fields: fieldsData,
        },
        curBusiItem.id,
      );
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
  };

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
          <ColumnSelect noLeftPadding noRightPadding={false} onClusterChange={(e) => setClusters(e)} />
          <SearchInput className={'searchInput'} placeholder={t('搜索名称或标签')} onSearch={setQuery} allowClear />
        </div>
        <div className='strategy-table-search-right'>
          <Button type='primary' onClick={goToAddWarningStrategy} className='strategy-table-search-right-create'>
            {t('新增记录规则')}
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
        rowKey='id'
        pagination={{
          total: currentStrategyData.length,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) => {
            return `共 ${total} 条数据`;
          },
          pageSizeOptions: pageSizeOptionsDefault,
          defaultPageSize: 30,
        }}
        loading={loading}
        dataSource={currentStrategyData}
        rowSelection={{
          selectedRowKeys: selectedRows.map((item) => item.id),
          onChange: (selectedRowKeys: React.Key[], selectedRows: strategyItem[]) => {
            setSelectRowKeys(selectedRowKeys);
            setSelectedRows(selectedRows);
          },
        }}
        columns={columns}
      />
      <ImportAndDownloadModal
        status={modalType}
        onClose={() => {
          setModalType(ModalStatus.None);
        }}
        onSuccess={() => {
          getRecordingRules();
        }}
        onSubmit={handleImportStrategy}
        title={t('记录规则')}
        exportData={exportData}
      />
      {isModalVisible && <EditModal isModalVisible={isModalVisible} editModalFinish={editModalFinish} />}
    </div>
  );
};

export default PageTable;
