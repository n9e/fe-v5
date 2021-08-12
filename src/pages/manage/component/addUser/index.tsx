import React, { useEffect, useState } from 'react';
import { Tag, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import BaseTable from '@/components/BaseTable';
import { getTeamInfo, getUserInfoList } from '@/services/manage';
import { TeamProps, User, Team } from '@/store/manageInterface';
import { ColumnsType } from 'antd/lib/table';
import './index.less';
import { useTranslation } from 'react-i18next';

const AddUser: React.FC<TeamProps> = (props: TeamProps) => {
  const { t } = useTranslation();
  const { teamId, onSelect } = props;
  const [teamInfo, setTeamInfo] = useState<Team>();
  const [selectedUser, setSelectedUser] = useState<React.Key[]>([]);
  const [selectedUserRows, setSelectedUserRows] = useState<User[]>([]);
  const [query, setQuery] = useState<string>('');
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
  useEffect(() => {
    getTeam();
  }, []);

  const getTeam = () => {
    if (!teamId) return;
    getTeamInfo(teamId).then((data) => {
      setTeamInfo(data.user_group);
    });
  };

  const handleClose = (val) => {
    let newList = selectedUserRows.filter((item) => item.id !== val.id);
    let newId = newList.map((item) => item.id);
    setSelectedUserRows(newList);
    setSelectedUser(newId);
  };

  const onSelectChange = (newKeys: [], newRows: []) => {
    onSelect(newKeys);
    setSelectedUser(newKeys);
    setSelectedUserRows(newRows);
  };

  return (
    <div>
      <div>
        <span>{t('团队名称')}：</span>
        {teamInfo && teamInfo.name}
      </div>
      <div
        style={{
          margin: '20px 0 16px',
        }}
      >
        {selectedUser.length > 0 && (
          <span>
            {t('已选择')}
            {selectedUser.length}
            {t('项')}：
          </span>
        )}
        {selectedUserRows.map((item, index) => {
          return (
            <Tag
              style={{
                marginBottom: '4px',
              }}
              closable
              onClose={() => handleClose(item)}
              key={item.id}
            >
              {item.username}
            </Tag>
          );
        })}
      </div>
      <Input
        className={'searchInput'}
        prefix={<SearchOutlined />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('用户名、邮箱或电话')}
        onPressEnter={(e) => setQuery(query)}
      />
      <BaseTable
        fetchHandle={getUserInfoList}
        columns={userColumn}
        rowKey='id'
        needPagination={true}
        pageSize={5}
        fetchParams={{
          query,
        }}
        rowSelection={{
          selectedRowKeys: selectedUser,
          onChange: onSelectChange,
        }}
      ></BaseTable>
    </div>
  );
};

export default AddUser;
