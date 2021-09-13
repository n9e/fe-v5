import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Tag,
  Button,
  Select,
  Modal,
  message,
  Switch,
  Dropdown,
  Radio,
  Checkbox,
  Row,
  Col,
} from 'antd';
import BaseTable from '@/components/BaseTable';
import {
  getStrategyGroupSubList,
  getStrategyGroup,
  updateAlertEventsStatus,
  batchDeleteStrategy,
  updateAlertEventsAppendTags,
  updateAlertEventsNotifyChannels,
  updateAlertEventsNotifyGroups,
} from '@/services/warning';
import SearchInput from '@/components/BaseSearchInput';
import { useHistory } from 'react-router-dom';
import {
  getNotifiesList,
  getTeamInfoList,
  getUserInfoList,
} from '@/services/manage';
import FormButtonModal from '@/components/BaseModal/formButtonModal';
import {
  strategyItem,
  strategyGroupItemBase,
  strategyStatus,
  warningStoreState,
} from '@/store/warningInterface';
import { addOrEditStrategy, deleteStrategy } from '@/services/warning';
import { priorityColor } from '@/utils/constant';
import { ColumnType } from 'antd/lib/table';
import dayjs from 'dayjs';
import { RootState } from '@/store/common';
import { createGroupModel } from './constant';
import { Team } from '@/store/manageInterface';
import RefreshIcon from '@/components/RefreshIcon';
import ColorTag from '@/components/ColorTag';
import {
  DownOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { getTemplate, getTemplateContent } from '@/services/dashboard';
import ImportAndDownloadModal, {
  ModalStatus,
} from '@/components/ImportAndDownloadModal';
const { Option } = Select;
const { confirm } = Modal;
const type = 'alert_rule';
const exportIgnoreAttrs = [
  'append_tags',
  'callbacks',
  'create_by',
  'group_id',
  'id',
  'notify_groups',
  'notify_users',
  'update_at',
  'update_by',
];
import { useTranslation } from 'react-i18next';
const exportIgnoreAttrsObj = Object.fromEntries(
  exportIgnoreAttrs.map((item) => [item, undefined]),
);

const PageTable: React.FC = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const tableRef = useRef(null);
  const dispatch = useDispatch();
  const exportTextRef = useRef(null as any);
  const [modalType, setModalType] = useState<ModalStatus>(ModalStatus.None);
  const [teamList, setTeamList] = useState<Array<Team>>([]);
  const [init, setInit] = useState<boolean>(false);
  const [selectRowKeys, setSelectRowKeys] = useState<React.Key[]>([]);
  const [selectRows, setSelectRows] = useState<strategyItem[]>([]);
  const [exportData, setExportData] = useState<string>('');
  const [groupItemBase, setGroupItemBase] = useState<
    Partial<strategyGroupItemBase>
  >({});
  const { currentGroup } = useSelector<RootState, warningStoreState>(
    (state) => state.strategy,
  );
  const [defaultOptions, setDefaultOptions] = useState<string[]>([]);
  const [query, setQuery] = useState<string>('');
  const [isDesc, setIsDesc] = useState<boolean>(false);
  const [FetchList, setFetchList] = useState<strategyItem[]>([]);
  const [isModalVisible, setisModalVisible] = useState<boolean>(false);
  const [allTodoTittle, setallTodoTittle] = useState<string>('');
  const [ids, setIds] = useState<number[]>([]);
  const [AllStatus, setAllStatus] = useState<number>(1);
  const [currentItems, setCurrentItems] = useState<number>(0);
  const [notifyUsers, setnotifyUsers] = useState<string>('');
  const [allGroups, setallGroups] = useState([]);
  const [allnotifyUsers, setallnotifyUsers] = useState([]);

  const [notifyGroups, setnotifyGroups] = useState<string>('');
  const [notifyChannels, setnotifyChannels] = useState<string>('');
  const [allChannels, setallChannels] = useState([]);
  const [appendTags, setnappendTags] = useState<string>('');

  useEffect(() => {
    getTeamInfoList().then((res) => {
      setallGroups(res.dat.list);
    });
    getUserInfoList().then((res) => {
      setallnotifyUsers(res.dat.list);
    });
    getNotifiesList().then((res) => {
      setallChannels(res);
    });
  }, []);

  useEffect(() => {
    getTemplate(type).then((res) => {
      setDefaultOptions(res.dat);
    });
    getTeamInfoList().then((data) => {
      setTeamList(data?.dat?.list || []);
    });
  }, []);
  useEffect(() => {
    if (currentGroup?.id) {
      getGroupItemBaseData();
      setInit(true);
    }
  }, [currentGroup?.id]);

  const getGroupItemBaseData = () => {
    if (currentGroup?.id) {
      getStrategyGroup(currentGroup.id).then((res) => {
        const { success, dat } = res;

        if (success) {
          setGroupItemBase(dat);
        }
      });
    }
  };

  const goToAddWarningStrategy = () => {
    currentGroup?.id && history.push(`/strategy/add/${currentGroup.id}`);
  };

  const handleClickEdit = (id, isClone = false) => {
    currentGroup?.id &&
      history.push(`/strategy/edit/${id}${isClone ? '?mode=clone' : ''}`);
  };

  const refreshList = () => {
    (tableRef.current as any).refreshList();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    confirm({
      title: t('是否确定删除该策略分组?'),
      icon: <ExclamationCircleOutlined />,
      onOk: () => {
        dispatch({
          type: `strategy/deleteGroup`,
          id: currentGroup?.id,
        });
      },

      onCancel() {},
    });
  };

  const columns: ColumnType<strategyItem>[] = [
    {
      title: t('级别'),
      dataIndex: 'priority',
      render: (data) => {
        return <Tag color={priorityColor[data - 1]}>P{data}</Tag>;
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
      dataIndex: 'notify_users_detail',
      render: (data, record) => {
        const array = data
          .concat(record.notify_groups_detail)
          .filter((item) => !!item);
        return (
          (array.length &&
            array.map(
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
        const array = data ? data.split(' ') : [];
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
      title: t('状态'),
      dataIndex: 'status',
      render: (status, record) => (
        <Switch
          checked={status === strategyStatus.Enable}
          size='small'
          onChange={() => {
            const { id, status } = record;
            updateAlertEventsStatus(
              [id],
              status === strategyStatus.Enable
                ? strategyStatus.UnEnable
                : strategyStatus.Enable,
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
                  title: t('是否删除该告警规则?'),
                  onOk: () => {
                    deleteStrategy(record.id).then(() => {
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
  const editModel = useCallback(() => {
    return createGroupModel(
      false,
      teamList,
      t,
      { ...groupItemBase, id: currentGroup?.id },
      () => {
        getGroupItemBaseData();
      },
    );
  }, [teamList, groupItemBase, currentGroup?.id]);
  const toStr = (selectRows, name, isStr = false) => {
    if (!isStr) {
      let set = new Set(
        selectRows
          .map((ele) => ele[name])
          .join(' ')
          .split(' '),
      );
      return Array.from(set).join(' ').trim().replace(/\s+/g, ' ');
    } else {
      let arr = selectRows.map((ele) => ele[name].split(' '));
      return Array.from(
        new Set(arr.toString().replace(/\,+/g, ' ').trim().split(' ')),
      ).join(' ');
    }
  };
  // const toVal = (Name, name) => {
  //   let arr = selectRows
  //     .map((ele) => {
  //       return ele[Name];
  //     })
  //     .filter((ele) => {
  //       return ele != null;
  //     });
  //   let res = [];

  //   toOneArr(arr, res, name);
  //   return Array.from(new Set(res));
  // };
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
    console.log(FetchList);
    let _selectRows: strategyItem[] = [];
    FetchList.forEach((ele, index) => {
      if (selectRowKeys.indexOf(ele.id) !== -1) {
        _selectRows.push(ele);
      }
    }); //通过selectRowKeys筛选最新返回的list

    let ids = _selectRows.map((ele) => ele.id);
    let notifyUsers = toStr(_selectRows, 'notify_users');
    let _notifyGroups = toStr(_selectRows, 'notify_groups');
    let notifyChannels = toStr(_selectRows, 'notify_channels', true);
    let appendTags = toStr(_selectRows, 'append_tags', true);

    console.log(_notifyGroups, 'notifyGroups');

    setIds(ids);
    setnotifyUsers(notifyUsers);
    setnotifyGroups(_notifyGroups);
    setnotifyChannels(notifyChannels);
    setnappendTags(appendTags);
    setCurrentItems(item);
    setallTodoTittle(title);
    setisModalVisible(true);
  };
  const modelOk = () => {
    switch (currentItems) {
      case 1:
        updateAlertEventsNotifyGroups([...ids], notifyGroups, notifyUsers).then(
          () => {
            setisModalVisible(false);
            message.success(t('修改接受者成功'));
            refreshList();
          },
        );
        break;
      case 2:
        updateAlertEventsNotifyChannels([...ids], notifyChannels).then(() => {
          setisModalVisible(false);
          message.success(t('修改媒介成功'));
          refreshList();
        });
        break;
      case 3:
        updateAlertEventsStatus(
          [...ids],
          AllStatus === strategyStatus.Enable
            ? strategyStatus.UnEnable
            : strategyStatus.Enable,
        ).then(() => {
          setisModalVisible(false);
          message.success(t('修改启停成功'));

          refreshList();
        });
        break;
      case 4:
        updateAlertEventsAppendTags([...ids], appendTags).then(() => {
          setisModalVisible(false);
          message.success(t('修改附加标签成功'));
          refreshList();
        });
        break;
      default:
        break;
    }
  };

  const notifyGroupsOptions = allGroups.map((ele: { id; name }, index) => (
    <Option value={ele.id} key={index}>
      {ele.name}
    </Option>
  ));
  const notifyUsersOptions = allnotifyUsers.map(
    (ele: { id; username }, index) => (
      <Option value={ele.id} key={index}>
        {ele.username}
      </Option>
    ),
  );
  const contactListCheckboxes = allChannels.map((ele: string, index) => {
    return (
      <Checkbox value={ele} key={index}>
        {ele}
      </Checkbox>
    );
  });
  const selectGroup = (val, options) => {
    setnotifyGroups(val.join(' '));
  };
  const selectUsers = (val, options) => {
    setnotifyUsers(val.join(' '));
  };
  const checkChannels = (val) => {
    console.log(val);
    setnotifyChannels(val.join(' '));
  };
  const handleTagsChange = (value: string[]) => {
    let top: string = value[value.length - 1];
    let reg = /\w+=\w+/;
    if (top && !reg.test(top)) {
      let v = value.pop();
      message.error(`"${v}"${t('不符合输入规范(格式为key=value)')}`);
    }

    setnappendTags(value.join(' '));
  };
  const menu = useMemo(() => {
    return (
      <ul className='ant-dropdown-menu'>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => setModalType(ModalStatus.Import)}
        >
          <span>{t('导入')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectRows.length) {
              const exportData = selectRows.map((item) => {
                return { ...item, ...exportIgnoreAttrsObj };
              });
              setExportData(JSON.stringify(exportData, null, 2));
              setModalType(ModalStatus.Export);
            } else {
              message.warning(t('未选择任何采集策略'));
            }
          }}
        >
          <span>{t('导出')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            if (selectRowKeys.length) {
              confirm({
                title: t('是否批量删除告警规则?'),
                onOk: () => {
                  batchDeleteStrategy(
                    currentGroup?.id,
                    selectRowKeys as number[],
                  ).then(() => {
                    message.success(t('删除成功'));
                    refreshList();
                  });
                },

                onCancel() {},
              });
            } else {
              message.warning(t('未选择任何采集策略'));
            }
          }}
        >
          <span>{t('批量删除')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            openModel(t('修改告警接受者'), 1);
          }}
        >
          <span>{t('修改告警接受者')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            openModel(t('通知媒介'), 2);
          }}
        >
          <span>{t('修改通知媒介')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            openModel(t('策略启用控制'), 3);
          }}
        >
          <span>{t('策略启用控制')}</span>
        </li>
        <li
          className='ant-dropdown-menu-item'
          onClick={() => {
            openModel(t('附加标签'), 4);
          }}
        >
          <span>{t('修改附加标签')}</span>
        </li>
      </ul>
    );
  }, [selectRowKeys, FetchList, t]);

  const defaultStrategyMenu = (
    <ul className='ant-dropdown-menu'>
      {defaultOptions.map((item, index) => (
        <li className='ant-dropdown-menu-item' key={index}>
          <span onClick={() => handleImportDefault(item)}>{item}</span>
        </li>
      ))}
    </ul>
  );

  const handleImportDefault = async (name) => {
    let { dat: content } = await getTemplateContent(type, name);
    await addOrEditStrategy(
      content.map((item) => ({ ...item, group_id: currentGroup?.id })),
    );
    refreshList();
  };

  const handleImportStrategy = (data) => {
    try {
      let importData = JSON.parse(data);
      return addOrEditStrategy(
        importData.map((item) => ({ ...item, group_id: currentGroup?.id })),
      ).then(() => refreshList());
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return (
    <div className='strategy-table-content'>
      <div className='strategy-table-title'>
        <div className='strategy-table-title-label'>
          {currentGroup?.name || ''}
          <FormButtonModal {...editModel()}></FormButtonModal>
          {currentGroup && (
            <DeleteOutlined
              onClick={handleDelete}
              style={{
                marginLeft: 8,
              }}
            />
          )}
        </div>
        <div className='strategy-table-title-sub'>
          <div className='strategy-table-title-sub-item'>
            {t('管理团队')}：
            {groupItemBase?.user_groups?.map((item) => item.name).join(' ') ||
              '-'}
          </div>
        </div>
      </div>
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
            placeholder={t('请输入告警策略名称')}
            onSearch={setQuery}
            allowClear
          />
        </div>
        <div className='strategy-table-search-right'>
          {/* <RedoOutlined
           className='strategy-table-search-left-refresh'
           onClick={() => {
             refreshList();
           }}
          /> */}

          <Button
            type='primary'
            onClick={goToAddWarningStrategy}
            className='strategy-table-search-right-create'
          >
            {t('新建告警策略')}
          </Button>
          <div className={'table-more-options'}>
            <Dropdown overlay={defaultStrategyMenu} trigger={['click']}>
              <Button onClick={(e) => e.stopPropagation()}>
                {t('导入内置策略')}
                <DownOutlined
                  style={{
                    marginLeft: 2,
                  }}
                />
              </Button>
            </Dropdown>
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
      <BaseTable
        ref={tableRef}
        rowKey='id'
        columns={columns}
        fetchParams={{ id: currentGroup?.id || '', query }}
        onFetchList={(res: strategyItem[]) => {
          setFetchList(res);
        }}
        fePaging
        autoFetch={false}
        initFetch={init}
        feQueryParams={['name']}
        fetchHandle={getStrategyGroupSubList}
        rowSelection={{
          selectedRowKeys: selectRowKeys,
          onChange: (
            selectedRowKeys: React.Key[],
            selectedRows: strategyItem[],
          ) => {
            setSelectRowKeys(selectedRowKeys);
            console.log(selectedRowKeys, 'selectedRowKeys');
            setSelectRows(selectedRows);
          },
        }}
      ></BaseTable>
      <ImportAndDownloadModal
        status={modalType}
        onClose={() => setModalType(ModalStatus.None)}
        onSubmit={handleImportStrategy}
        title={t('策略')}
        exportData={exportData}
      />
      <Modal
        title={allTodoTittle}
        visible={isModalVisible}
        onOk={modelOk}
        onCancel={() => {
          setisModalVisible(false);
        }}
      >
        {(() => {
          switch (currentItems) {
            case 1:
              return (
                <>
                  <Row align='middle'>
                    <Col span={4} style={{ textAlign: 'center' }}>
                      <span>{t('报警接收团队')}:</span>
                    </Col>
                    <Col span={20}>
                      <Select
                        value={
                          notifyGroups
                            ? notifyGroups.split(' ').map((ele) => Number(ele))
                            : []
                        }
                        mode='multiple'
                        onChange={selectGroup}
                        style={{
                          width: '90%',
                          marginLeft: 10,
                        }}
                      >
                        {notifyGroupsOptions}
                      </Select>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 10 }} align='middle'>
                    <Col span={4} style={{ textAlign: 'center' }}>
                      <span>{t('报警接收人')}:</span>
                    </Col>
                    <Col span={20}>
                      <Select
                        value={
                          notifyUsers
                            ? notifyUsers.split(' ').map((ele) => Number(ele))
                            : []
                        }
                        mode='multiple'
                        onChange={selectUsers}
                        style={{
                          width: '90%',
                          marginLeft: 10,
                        }}
                      >
                        {notifyUsersOptions}
                      </Select>
                    </Col>
                  </Row>
                </>
              );

            case 2:
              return (
                <>
                  <Row align='middle'>
                    <Col span={4}>
                      <span>{t('修改通知媒介')}:</span>
                    </Col>
                    <Col span={20}>
                      <Checkbox.Group
                        style={{ marginLeft: 10 }}
                        defaultValue={notifyChannels.split(' ')}
                        onChange={checkChannels}
                      >
                        {contactListCheckboxes}
                      </Checkbox.Group>
                    </Col>
                  </Row>
                </>
              );
            case 3:
              return (
                <>
                  <Row align='middle'>
                    <Col span={4} style={{ textAlign: 'center' }}>
                      <span>{t('是否启停')}:</span>
                    </Col>
                    <Col span={20}>
                      <Radio.Group
                        style={{ marginLeft: 10, textAlign: 'center' }}
                        onChange={(e) => {
                          setAllStatus(e.target.value);
                        }}
                        value={AllStatus}
                      >
                        <Radio value={strategyStatus.Enable}>{t('否')}</Radio>
                        <Radio value={strategyStatus.UnEnable}>{t('是')}</Radio>
                      </Radio.Group>
                    </Col>
                  </Row>
                </>
              );
            case 4:
              return (
                <>
                  <Row align='middle'>
                    <Col span={4} style={{ textAlign: 'center' }}>
                      <span>{t('append_tags')}:</span>
                    </Col>
                    <Col span={20}>
                      <Select
                        style={{ width: '90%', marginLeft: 10 }}
                        mode='tags'
                        value={appendTags ? appendTags.split(' ') : []}
                        onChange={handleTagsChange}
                        placeholder={t('请输入附加标签，格式为key=value')}
                      ></Select>
                    </Col>
                  </Row>
                </>
              );
            default:
              return null;
          }
        })()}
      </Modal>
    </div>
  );
};

export default PageTable;
