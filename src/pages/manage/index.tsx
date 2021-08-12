import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Button,
  Table,
  Input,
  Switch,
  message,
  List,
  Row,
  Col,
  Pagination,
  Modal,
} from 'antd';
import {
  DeleteTwoTone,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  SmallDashOutlined,
} from '@ant-design/icons';
import BaseTable, { IBaseTableProps } from '@/components/BaseTable';
import PageLayout from '../../components/pageLayout';
import UserInfoModal from './component/createModal';
import DelPopover from './component/delPopover';
import { RootState, accountStoreState } from '@/store/accountInterface';
import {
  getUserInfoList,
  getTeamInfoList,
  getTeamInfo,
  changeStatus,
  deleteUser,
  deleteTeam,
  deleteMember,
} from '@/services/manage';
import {
  User,
  Team,
  UserType,
  ActionType,
  TeamInfo,
} from '@/store/manageInterface';
import './index.less';
import { ColumnsType } from 'antd/lib/table';
import { color } from 'echarts';
import { useTranslation } from 'react-i18next';
const { confirm } = Modal;

export const PAGE_SIZE = 20;

const Resource: React.FC = () => {
  const { t } = useTranslation();
  const { type } =
    useParams<{
      type: string;
    }>();
  const [activeKey, setActiveKey] = useState<UserType>(UserType.User);
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [userId, setUserId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [memberList, setMemberList] = useState<User[]>([]);
  const [memberTotal, setMemberTotal] = useState<number>(0);
  const [allMemberList, setAllMemberList] = useState<User[]>([]);
  const [teamInfo, setTeamInfo] = useState<Team>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [query, setQuery] = useState<string>('');
  const [memberLoading, setMemberLoading] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchMemberValue, setSearchMemberValue] = useState<string>('');
  const userRef = useRef(null as any);
  let { profile } = useSelector<RootState, accountStoreState>(
    (state) => state.account,
  );
  const userColumn: ColumnsType<User> = [
    {
      title: t('用户名'),
      dataIndex: 'username',
      ellipsis: true,
    },
    {
      title: t('显示名'),
      dataIndex: 'nickname',
      ellipsis: true,
      render: (text: string, record) => record.nickname || '-',
    },
    {
      title: t('邮箱'),
      dataIndex: 'email',
      render: (text: string, record) => record.email || '-',
    },
    {
      title: t('手机'),
      dataIndex: 'phone',
      render: (text: string, record) => record.phone || '-',
    },
  ];
  const userColumns: ColumnsType<User> = [
    ...userColumn,
    {
      title: t('角色'),
      dataIndex: 'roles',
      render: (text: [], record) => text.join(', '),
    },
    {
      title: t('启用'),
      width: '80px',
      render: (text: string, record) => (
        <Switch
          checked={record.status === 0}
          disabled={!profile.roles.includes('Admin')}
          size='small'
          onChange={() => handleChecked(record.status, record.id)}
        />
      ),
    },
    {
      title: t('操作'),
      width: '240px',
      render: (text: string, record) => (
        <>
          <Button
            className='oper-name'
            type='link'
            onClick={() => handleClick(ActionType.EditUser, record.id)}
          >
            {t('编辑')}
          </Button>
          <Button
            className='oper-name'
            type='link'
            onClick={() => handleClick(ActionType.Reset, record.id)}
          >
            {t('重置密码')}
          </Button>
          {/* <DelPopover
         userId={record.id}
         userType='user'
         onClose={() => handleClose()}
        ></DelPopover> */}
          <a
            style={{
              color: 'red',
              marginLeft: '16px',
            }}
            onClick={() => {
              confirm({
                title: t('是否删除该用户'),
                onOk: () => {
                  deleteUser(record.id).then((_) => {
                    message.success(t('用户删除成功'));
                    handleClose();
                  });
                },
                onCancel: () => {},
              });
            }}
          >
            {t('删除')}
          </a>
        </>
      ),
    },
  ];

  if (!profile.roles.includes('Admin')) {
    userColumns.pop(); //普通用户不展示操作列
  }

  const teamMemberColumns: ColumnsType<User> = [
    ...userColumn,
    {
      title: t('操作'),
      width: '100px',
      render: (
        text: string,
        record, // <DelPopover
      ) => (
        //   teamId={teamId}
        //   memberId={record.id}
        //   userType='member'
        //   onClose={() => handleClose()}
        // ></DelPopover>
        <a
          style={{
            color: 'red',
          }}
          onClick={() => {
            let params = {
              ids: [record.id],
            };
            confirm({
              title: t('是否删除该成员'),
              onOk: () => {
                deleteMember(teamId, params).then((_) => {
                  message.success(t('成员删除成功'));
                  handleClose();
                });
              },
              onCancel: () => {},
            });
          }}
        >
          {t('删除')}
        </a>
      ),
    },
  ];
  useEffect(() => {
    switch (type) {
      case 'user':
        setActiveKey(UserType.User);
        break;

      case 'group':
        setActiveKey(UserType.Team);
        break;

      default:
        setActiveKey(UserType.User);
    }
  }, [type]); // tab切换触发

  useEffect(() => {
    getList();
  }, [activeKey]); //teamId变化触发

  useEffect(() => {
    if (activeKey === UserType.Team && teamId) {
      // if (teamList.find((t) => t.id === teamId)) {
      //   getTeamInfoDetail(teamId);
      // } else if (teamList.length > 0) {
      //   getTeamInfoDetail(teamList[0].id);
      // }
      getTeamInfoDetail(teamId);
    }
  }, [teamId]);
  // useEffect(() => {
  //   if (activeKey === UserType.Team) {
  //     getTeamList(true);
  //   }
  // }, [pageNumber]);

  const getList = (isDeleteOrAdd = false) => {
    if (activeKey === UserType.User) {
      userRef.current.refreshList();
    } else {
      if (isDeleteOrAdd) {
        setPageNumber(1);
      }
      getTeamList(
        undefined,
        isDeleteOrAdd ? 1 : undefined,
        undefined,
        isDeleteOrAdd,
      );
    }
  };

  // 获取团队列表
  const getTeamList = (
    isAppend = false,
    p?: number,
    search?: string,
    isDelete?: boolean,
  ) => {
    let params = {
      query: search === undefined ? searchValue : search,
      p: p || pageNumber,
      limit: PAGE_SIZE,
      isAppend,
    };
    getTeamInfoList(params).then((data) => {
      if (isAppend) {
        setTeamList(teamList.concat(data.dat.list || []));
      } else {
        setTeamList(data.dat.list || []);
      }
      setTotal(data.dat.total);

      if (!teamId || isDelete) {
        setTeamId(data.dat.list[0].id);
      }
    });
  };

  // 获取团队详情
  const getTeamInfoDetail = (id: string) => {
    setMemberLoading(true);
    getTeamInfo(id).then((data: TeamInfo) => {
      setTeamInfo(data.user_group);
      setMemberList(data.users);
      setAllMemberList(data.users);
      setMemberTotal(data.users.length);
      setMemberLoading(false);
    });
  };

  const handleSearch = (type?: string, val?: string) => {
    if (type === 'team') {
      getTeamList(false, 1, val);
    } else {
      if (!val) {
        getTeamInfoDetail(teamId);
      } else {
        setMemberLoading(true);
        let newList = allMemberList.filter(
          (item) =>
            item.username.indexOf(val) !== -1 ||
            item.id.toString().indexOf(val) !== -1 ||
            item.phone.indexOf(val) !== -1 ||
            item.email.indexOf(val) !== -1,
        );
        setMemberList(newList);
        setMemberLoading(false);
      }
    }
  };

  const handleClick = (type: ActionType, id?: string, memberId?: string) => {
    if (id) {
      activeKey === UserType.User ? setUserId(id) : setTeamId(id);
    } else {
      activeKey === UserType.User ? setUserId('') : setTeamId('');
    }

    if (memberId) {
      setMemberId(memberId);
    } else {
      setMemberId('');
    }

    setAction(type);
    setVisible(true);
  };

  // 弹窗关闭回调
  const handleClose = (isDeleteOrAdd = false) => {
    setVisible(false);
    if (searchValue) {
      handleSearch('team', searchValue);
    } else {
      getList(isDeleteOrAdd);
    }

    if (teamId && !isDeleteOrAdd) {
      getTeamInfoDetail(teamId);
    }
  };

  const handleChecked = (type: number, id) => {
    if (type === 0) {
      let params = {
        status: 1,
      };
      changeStatus(id, params).then((_) => {
        message.success(t('禁用成功'));
        handleClose();
      });
    } else {
      let params = {
        status: 0,
      };
      changeStatus(id, params).then((_) => {
        message.success(t('启用成功'));
        handleClose();
      });
    }
  };

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  return (
    <div className='user-manage-content'>
      {activeKey === UserType.User && (
        <div className='user-content'>
          <div className={'user-manage-title'}>
            <span>
              <UserOutlined style={{ marginRight: 10 }} />
              {t('用户管理')}
            </span>
          </div>
          <Row className='event-table-search' style={{ paddingTop: 20 }}>
            <div className='event-table-search-left'>
              <Input
                className={'searchInput'}
                prefix={<SearchOutlined />}
                onPressEnter={onSearchQuery}
                placeholder={t('用户名、邮箱或手机')}
              />
            </div>
            <div className='event-table-search-right'>
              {activeKey === UserType.User && profile.roles.includes('Admin') && (
                <div className='user-manage-operate'>
                  <Button
                    type='primary'
                    onClick={() =>
                      handleClick(
                        activeKey === UserType.User
                          ? ActionType.CreateUser
                          : t('创建团队'),
                      )
                    }
                  >
                    {t('创建用户')}
                  </Button>
                </div>
              )}
            </div>
          </Row>
          <BaseTable
            ref={userRef}
            fetchHandle={getUserInfoList}
            columns={userColumns}
            rowKey='id'
            needPagination={true}
            fetchParams={{
              query,
            }}
          ></BaseTable>
        </div>
      )}
      {activeKey === UserType.Team && (
        <div style={{ display: 'flex', height: '100%' }}>
          <div className='left-tree-area'>
            <div className={'title'}>{t('团队管理')}</div>
            <div className='sub-title'>
              {t('团队列表')}
              <Button
                style={{
                  height: '30px',
                }}
                size='small'
                type='link'
                onClick={() => {
                  handleClick(ActionType.CreateTeam);
                }}
              >
                {t('新建团队')}
              </Button>
            </div>
            <div style={{ display: 'flex', margin: '5px 0px 12px' }}>
              <Input
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
                placeholder={t('搜索团队名称')}
                onPressEnter={(e) => {
                  setPageNumber(1);
                  // @ts-ignore
                  getTeamList(false, 1, e.target.value);
                }}
              />
            </div>

            <List
              style={{
                marginBottom: '12px',
              }}
              dataSource={teamList}
              size='small'
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  className={teamId === item.id ? 'is-active' : ''}
                  onClick={() => setTeamId(item.id)}
                >
                  {item.name}
                </List.Item>
              )}
            />

            {PAGE_SIZE * pageNumber < total ? (
              <SmallDashOutlined
                className={'load-more'}
                onClick={() => {
                  setPageNumber(pageNumber + 1);
                  getTeamList(true, pageNumber + 1);
                }}
              />
            ) : null}
          </div>
          <div className='resource-table-content' style={{ margin: 20 }}>
            <Row className='team-info'>
              <Col
                span='24'
                style={{
                  color: '#000',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'inline',
                }}
              >
                {teamInfo && teamInfo.name}
                <EditOutlined
                  title={t('刷新')}
                  style={{
                    marginLeft: '8px',
                    fontSize: '14px',
                  }}
                  onClick={() => handleClick(ActionType.EditTeam, teamId)}
                ></EditOutlined>
                {/* <DelPopover
                 teamId={teamId}
                 userType='team'
                 isIcon={true}
                 onClose={() => handleClose()}
                ></DelPopover> */}
                <DeleteOutlined
                  style={{
                    marginLeft: '8px',
                    fontSize: '14px',
                  }}
                  onClick={() => {
                    confirm({
                      title: t('是否删除该团队'),
                      onOk: () => {
                        deleteTeam(teamId).then((_) => {
                          message.success(t('团队删除成功'));
                          handleClose(true);
                        });
                      },
                      onCancel: () => {},
                    });
                  }}
                />
              </Col>
              <Col
                style={{
                  marginTop: '8px',
                  color: '#666',
                }}
              >
                {t('备注')}：{teamInfo && teamInfo.note ? teamInfo.note : '-'}
              </Col>
            </Row>
            <Row justify='space-between' align='middle'>
              <Col span='12'>
                <Input
                  prefix={<SearchOutlined />}
                  value={searchMemberValue}
                  className={'searchInput'}
                  onChange={(e) => setSearchMemberValue(e.target.value)}
                  placeholder={t('成员名、邮箱或手机')}
                  onPressEnter={(e) =>
                    handleSearch('member', searchMemberValue)
                  }
                />
              </Col>
              <Button
                type='primary'
                onClick={() => {
                  handleClick(ActionType.AddUser, teamId);
                }}
              >
                {t('添加成员')}
              </Button>
            </Row>

            <Table
              rowKey='id'
              columns={teamMemberColumns}
              dataSource={memberList}
              loading={memberLoading}
            />
          </div>
        </div>
      )}
      <UserInfoModal
        visible={visible}
        action={action as ActionType}
        userType={activeKey}
        onClose={handleClose}
        onSearch={(val) => {
          setSearchValue(val);
          handleSearch('team', val);
        }}
        userId={userId}
        teamId={teamId}
        memberId={memberId}
      />
    </div>
  );
};

export default Resource;
