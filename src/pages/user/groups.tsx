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
                  handleClose('updateMember');
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
    getTeamList('', isDeleteOrAdd);
  };

  // 获取团队列表
  const getTeamList = (search?: string, isDelete?: boolean) => {
    getTeamInfoList({ query: search || '' }).then((data) => {
      setTeamList(data.dat || []);
      if ((!teamId || isDelete) && data.dat.length > 0) {
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
      getTeamList(val);
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
  const handleClose = (isDeleteOrAdd: boolean | string = false) => {
    setVisible(false);
    if (searchValue) {
      handleSearch('team', searchValue);
    } else {
      // 添加、删除成员 不用获取列表
      if (isDeleteOrAdd !== 'updateMember') {
        getList(isDeleteOrAdd !== 'updateName'); // 修改名字，不用选中第一个
      }
    }
    if (teamId && (isDeleteOrAdd === 'update' || isDeleteOrAdd === 'updateMember' || isDeleteOrAdd === 'updateName')) {
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
                onPressEnter={(e) => {
                  // @ts-ignore
                  getTeamList(e.target.value);
                }}
                onBlur={(e) => {
                  // @ts-ignore
                  getTeamList(e.target.value);
                }}
              />
            </div>

            <List
              style={{
                marginBottom: '12px',
                flex: 1,
                overflow: 'auto',
              }}
              dataSource={teamList}
              size='small'
              renderItem={(item) => (
                <List.Item key={item.id} className={teamId === item.id ? 'is-active' : ''} onClick={() => setTeamId(item.id)}>
                  {item.name}
                </List.Item>
              )}
            />
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
                没有与您相关的团队，请先&nbsp;
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
