import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import { Button, Table, Input, Switch, message, List, Row, Col, Pagination, Modal } from 'antd';
import { DeleteTwoTone, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined, SmallDashOutlined, InfoCircleOutlined } from '@ant-design/icons';
import BaseTable, { IBaseTableProps } from '@/components/BaseTable';
import UserInfoModal from './component/createModal';
import DelPopover from './component/delPopover';
import { RootState, accountStoreState } from '@/store/accountInterface';
import { getUserInfoList, getTeamInfoList, getTeamInfo, changeStatus, deleteUser, deleteTeam, deleteMember } from '@/services/manage';
import { User, Team, UserType, ActionType, TeamInfo } from '@/store/manageInterface';
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
  const [activeKey, setActiveKey] = useState<UserType>(UserType.Team);
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [userId, setUserId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [memberList, setMemberList] = useState<User[]>([]);
  const [allMemberList, setAllMemberList] = useState<User[]>([]);
  const [teamInfo, setTeamInfo] = useState<Team>();
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [memberLoading, setMemberLoading] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchMemberValue, setSearchMemberValue] = useState<string>('');
  const userRef = useRef(null as any);
  let { profile } = useSelector<RootState, accountStoreState>((state) => state.account);
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
    // {
    //   title: t('启用'),
    //   width: '80px',
    //   render: (text: string, record) => (
    //     <Switch
    //       checked={record.status === 0}
    //       disabled={!profile.roles.includes('Admin')}
    //       size='small'
    //       onChange={() => handleChecked(record.status, record.id)}
    //     />
    //   ),
    // },
    {
      title: t('操作'),
      width: '240px',
      render: (text: string, record) => (
        <>
          <Button className='oper-name' type='link' onClick={() => handleClick(ActionType.EditUser, record.id)}>
            {t('编辑')}
          </Button>
          <Button className='oper-name' type='link' onClick={() => handleClick(ActionType.Reset, record.id)}>
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
    getList(true);
  }, []); //teamId变化触发

  useEffect(() => {
    if (teamId) {
      getTeamInfoDetail(teamId);
    }
  }, [teamId]);

  const getList = (isDeleteOrAdd = false) => {
    if (isDeleteOrAdd) {
      setPageNumber(1);
    }
    getTeamList(undefined, isDeleteOrAdd ? 1 : undefined, undefined, isDeleteOrAdd);
  };

  // 获取团队列表
  const getTeamList = (isAppend = false, p?: number, search?: string, isDelete?: boolean) => {
    getTeamInfoList().then((data) => {
      if (isAppend) {
        setTeamList(teamList.concat(data.dat || []));
      } else {
        setTeamList(data.dat || []);
      }
      setTotal(data.dat.total);

      if (!teamId || isDelete) {
        setTeamId(data.dat[0].id);
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
            item.nickname.indexOf(val) !== -1 ||
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
      setTeamId(id);
    } else {
      setTeamId('');
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
      isDeleteOrAdd === true && getList(isDeleteOrAdd);
    }

    if (teamId) {
      getTeamInfoDetail(teamId);
    }
  };

  return (
    <PageLayout title={t('团队管理')} icon={<UserOutlined />} hideCluster>
      <div className='user-manage-content'>
        <div style={{ display: 'flex', height: '100%' }}>
          <div className='left-tree-area'>
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
                // onPressEnter={(e) => {
                //   setPageNumber(1);
                //   // @ts-ignore
                //   getTeamList(false, 1, e.target.value);
                // }}
              />
            </div>

            <List
              style={{
                marginBottom: '12px',
                flex: 1,
                overflow: 'auto',
              }}
              dataSource={teamList.filter((i) => i.name.includes(searchValue))}
              size='small'
              renderItem={(item) => (
                <List.Item key={item.id} className={teamId === item.id ? 'is-active' : ''} onClick={() => setTeamId(item.id)}>
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
          {teamList.length > 0 ? (
            <div className='resource-table-content'>
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
                    placeholder={t('用户名、显示名、邮箱或手机')}
                    onPressEnter={(e) => handleSearch('member', searchMemberValue)}
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

              <Table rowKey='id' columns={teamMemberColumns} dataSource={memberList} loading={memberLoading} />
            </div>
          ) : (
            <div className='blank-busi-holder'>
              <p style={{ textAlign: 'left', fontWeight: 'bold' }}>
                <InfoCircleOutlined style={{ color: '#1473ff' }} /> {t('提示信息')}
              </p>
              <p>
                没有与您相关的团队，请先
                <a onClick={() => handleClick(ActionType.CreateTeam)}>创建团队</a>
              </p>
            </div>
          )}
        </div>
        <UserInfoModal
          visible={visible}
          action={action as ActionType}
          width={500}
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
    </PageLayout>
  );
};

export default Resource;
