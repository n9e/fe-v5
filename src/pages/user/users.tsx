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

  const [activeKey, setActiveKey] = useState<UserType>(UserType.User);
  const [visible, setVisible] = useState<boolean>(false);
  const [action, setAction] = useState<ActionType>();
  const [userId, setUserId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [allMemberList, setAllMemberList] = useState<User[]>([]);
  const [teamList, setTeamList] = useState<Team[]>([]);
  const [query, setQuery] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
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

  const getList = () => {
    userRef.current.refreshList();
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
  const handleClose = () => {
    setVisible(false);
    getList();
  };

  const onSearchQuery = (e) => {
    let val = e.target.value;
    setQuery(val);
  };

  return (
    <PageLayout title={t('用户管理')} icon={<UserOutlined />} hideCluster>
      <div className='user-manage-content'>
        <div className='user-content'>
          <Row className='event-table-search'>
            <div className='event-table-search-left'>
              <Input className={'searchInput'} prefix={<SearchOutlined />} onPressEnter={onSearchQuery} placeholder={t('用户名、邮箱或手机')} />
            </div>
            <div className='event-table-search-right'>
              {activeKey === UserType.User && profile.roles.includes('Admin') && (
                <div className='user-manage-operate'>
                  <Button type='primary' onClick={() => handleClick(activeKey === UserType.User ? ActionType.CreateUser : t('创建团队'))}>
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

        <UserInfoModal
          visible={visible}
          action={action as ActionType}
          width={activeKey === UserType.User ? 500 : 700}
          userType={activeKey}
          onClose={handleClose}
          userId={userId}
          teamId={teamId}
          memberId={memberId}
        />
      </div>
    </PageLayout>
  );
};

export default Resource;
