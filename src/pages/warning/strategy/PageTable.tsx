/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState, useMemo } from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { Tag, Button, Modal, message, Switch, Dropdown, Table, Tabs, Select, Space } from 'antd';
import { getStrategyGroupSubList, updateAlertRules } from '@/services/warning';
import SearchInput from '@/components/BaseSearchInput';
import { useHistory, Link } from 'react-router-dom';
import { strategyItem, strategyStatus } from '@/store/warningInterface';
import { CommonStoreState } from '@/store/commonInterface';
import { addOrEditStrategy, deleteStrategy, getBuiltinAlerts, createBuiltinAlerts } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import { ColumnType } from 'antd/lib/table';
import { pageSizeOptionsDefault } from '../const';
import dayjs from 'dayjs';
import { RootState } from '@/store/common';
import RefreshIcon from '@/components/RefreshIcon';
import ColorTag from '@/components/ColorTag';
import { DownOutlined } from '@ant-design/icons';
import ImportAndDownloadModal, { ModalStatus } from '@/components/ImportAndDownloadModal';
import EditModal from './components/editModal';
import ColumnSelect from '@/components/ColumnSelect';
import AdvancedWrap from '@/components/AdvancedWrap';
const { confirm } = Modal;
const { TabPane } = Tabs;

import { useTranslation } from 'react-i18next';
const exportIgnoreAttrsObj = {
  cluster: undefined,
  create_by: undefined,
  group_id: undefined,
  id: undefined,
  notify_groups_obj: undefined,
  notify_groups: undefined,
  notify_users: undefined,
  create_at: undefined,
  update_at: undefined,
  update_by: undefined,
};
interface Props {
  bgid?: number;
}

const PageTable: React.FC<Props> = ({ bgid }) => {
  const [severity, setSeverity] = useState<number>();
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
  const [cate, setCate] = useState<string>();

  useEffect(() => {
    if (bgid) {
      getAlertRules();
    }
  }, [bgid, severity]);

  useEffect(() => {
    filterData();
  }, [query, clusters, currentStrategyDataAll]);

  const getAlertRules = async () => {
    if (!bgid) {
      return;
    }
    setLoading(true);
    const { success, dat } = await getStrategyGroupSubList({ id: bgid });
    if (success) {
      setCurrentStrategyDataAll(
        dat.filter((item) => {
          return !severity || item.severity === severity;
        }) || [],
      );
      setLoading(false);
    }
  };

  const filterData = () => {
    const data = JSON.parse(JSON.stringify(currentStrategyDataAll));
    const res = data.filter((item) => {
      const lowerCaseQuery = query.toLowerCase();
      return (
        (item.name.toLowerCase().indexOf(lowerCaseQuery) > -1 || item.append_tags.join(' ').toLowerCase().indexOf(lowerCaseQuery) > -1) &&
        ((clusters && clusters?.indexOf(item.cluster) > -1) || clusters?.length === 0)
      );
    });
    setCurrentStrategyData(res || []);
  };

  const goToAddWarningStrategy = () => {
    curBusiItem?.id && history.push(`/alert-rules/add/${curBusiItem.id}`);
  };

  const refreshList = () => {
    getAlertRules();
  };

  const columns: ColumnType<strategyItem>[] = [
    {
      title: t('集群'),
      dataIndex: 'cluster',
      render: (data) => {
        const array = data.split(' ') || [];
        return (
          (array.length &&
            array.map((tag: string, index: number) => {
              return <ColorTag text={tag} key={index}></ColorTag>;
            })) || <div></div>
        );
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
          <Link
            className='table-active-text'
            to={{
              pathname: `/alert-rules/edit/${record.id}`,
            }}
            target='_blank'
          >
            {data}
          </Link>
        );
      },
    },
    {
      title: t('告警接收者'),
      dataIndex: 'notify_groups_obj',
      width: 100,
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
                return <ColorTag text={user.nickname || user.username || user.name} key={index}></ColorTag>;
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
      width: 120,
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
            updateAlertRules(
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
      width: 160,
      render: (data, record: any) => {
        return (
          <div className='table-operator-area'>
            <Link
              className='table-operator-area-normal'
              style={{ marginRight: 8 }}
              to={{
                pathname: `/alert-rules/edit/${record.id}?mode=clone`,
              }}
              target='_blank'
            >
              {t('克隆')}
            </Link>
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
            {record.algorithm === 'holtwinters' && (
              <div>
                <Link to={{ pathname: `/alert-rules/brain/${record.id}` }}>训练结果</Link>
              </div>
            )}
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
        <li className='ant-dropdown-menu-item' onClick={() => setModalType(ModalStatus.BuiltIn)}>
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
                  deleteStrategy(selectRowKeys as number[], curBusiItem?.id).then(() => {
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
      const res = await updateAlertRules(
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
        <Space>
          <RefreshIcon
            onClick={() => {
              refreshList();
            }}
          />
          <AdvancedWrap var='VITE_IS_ALERT_ES_DS'>
            <Select
              value={cate}
              onChange={(val) => {
                setCate(val);
              }}
              style={{ width: 120 }}
              placeholder='数据源类型'
              allowClear
            >
              <Select.Option value='prometheus'>Prometheus</Select.Option>
              <Select.Option value='elasticsearch'>Elasticsearch</Select.Option>
            </Select>
          </AdvancedWrap>
          <ColumnSelect noLeftPadding noRightPadding onSeverityChange={(e) => setSeverity(e)} onClusterChange={(e) => setClusters(e)} />
          <SearchInput className={'searchInput'} placeholder={t('搜索名称或标签')} onSearch={setQuery} allowClear />
        </Space>
        <div className='strategy-table-search-right'>
          <Button type='primary' onClick={goToAddWarningStrategy} className='strategy-table-search-right-create' ghost>
            {t('新增告警规则')}
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
        // sticky
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
        dataSource={_.filter(currentStrategyData, (item) => {
          const curItemCate = item.cate || 'prometheus';
          if (cate) {
            return curItemCate === cate;
          }
          return true;
        })}
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
        bgid={bgid}
        status={modalType}
        fetchBuiltinFunc={getBuiltinAlerts}
        submitBuiltinFunc={createBuiltinAlerts}
        onClose={() => {
          setModalType(ModalStatus.None);
        }}
        onSuccess={() => {
          getAlertRules();
        }}
        onSubmit={handleImportStrategy}
        label='告警规则'
        title={
          ModalStatus.Export === modalType ? (
            '告警规则'
          ) : (
            <Tabs defaultActiveKey={ModalStatus.BuiltIn} onChange={(e: ModalStatus) => setModalType(e)} className='custom-import-alert-title'>
              <TabPane tab=' 导入内置告警规则' key={ModalStatus.BuiltIn}></TabPane>
              <TabPane tab='导入告警规则JSON' key={ModalStatus.Import}></TabPane>
            </Tabs>
          )
        }
        exportData={exportData}
      />
      {isModalVisible && <EditModal isModalVisible={isModalVisible} editModalFinish={editModalFinish} />}
    </div>
  );
};

export default PageTable;
