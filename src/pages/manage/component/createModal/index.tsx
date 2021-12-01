import React, { useRef, useState } from 'react';
import { Modal, message, Button } from 'antd';
import UserForm from '../userForm';
import TeamForm from '../teamForm';
import BusinessForm from '../businessForm';
import PasswordForm from '../passwordForm';
import AddUser from '../addUser';
import {
  createUser,
  createTeam,
  changeUserInfo,
  changeTeamInfo,
  changeUserPassword,
  addTeamUser,
  createBusinessTeam,
  changeBusinessTeam,
  addBusinessMember,
} from '@/services/manage';
import { ModalProps, User, Team, UserType, ActionType, Contacts } from '@/store/manageInterface';
import { useTranslation } from 'react-i18next';

const CreateModal: React.FC<ModalProps> = (props: ModalProps) => {
  const { t } = useTranslation();
  const { visible, userType, onClose, action, userId, teamId, onSearch, width } = props;
  const [selectedUser, setSelectedUser] = useState<string[]>();
  const userRef = useRef(null as any);
  const teamRef = useRef(null as any);
  const passwordRef = useRef(null as any);
  const isBusinessForm = userType === 'business' && (action === ActionType.CreateBusiness || action === ActionType.AddBusinessMember || action === ActionType.EditBusiness);
  const isUserForm: boolean = (action === ActionType.CreateUser || action === ActionType.EditUser) && userType === UserType.User ? true : false;
  const isTeamForm: boolean = (action === ActionType.CreateTeam || action === ActionType.EditTeam) && userType === UserType.Team ? true : false;
  const isPasswordForm: boolean = action === ActionType.Reset ? true : false;
  const isAddUser: boolean = action === ActionType.AddUser ? true : false;

  const onOk = async (val?: string) => {
    if (isUserForm) {
      let form = userRef.current.form;
      const values: User = await form.validateFields();
      let contacts = {};
      values.contacts &&
        values.contacts.forEach((item: Contacts) => {
          contacts[item.key] = item.value;
        });
      let params = { ...values, contacts, confirm: undefined };

      if (action === ActionType.CreateUser) {
        createUser(params).then((_) => {
          message.success(t('用户创建成功'));
          onClose();
        });
      }

      if (action === ActionType.EditUser && userId) {
        changeUserInfo(userId, params).then((_) => {
          message.success(t('用户信息修改成功'));
          onClose();
        });
      }
    }

    if (isTeamForm) {
      let form = teamRef.current.form;
      const values: Team = await form.validateFields();
      let params = { ...values };

      if (action === ActionType.CreateTeam) {
        createTeam(params).then((_) => {
          message.success(t('团队创建成功'));
          onClose(true);

          if (val === 'search') {
            onSearch(params.name);
          }
        });
      }

      if (action === ActionType.EditTeam && teamId) {
        changeTeamInfo(teamId, params).then((_) => {
          message.success(t('团队信息修改成功'));
          onClose(true);
        });
      }
    }

    if (isPasswordForm && userId) {
      let form = passwordRef.current.form;
      const values = await form.validateFields();
      let params = { ...values };
      changeUserPassword(userId, params).then((_) => {
        message.success(t('密码重置成功'));
        onClose();
      });
    }

    if (isAddUser && teamId) {
      let params = {
        ids: selectedUser,
      };
      addTeamUser(teamId, params).then((_) => {
        message.success(t('添加成功'));
        onClose();
      });
    }
    if (isBusinessForm) {
      let form = teamRef.current.form;
      const { name, members } = await form.validateFields();
      let params = {
        name,
        members: members
          ? members.map(({ perm_flag, user_group_id }) => ({
              user_group_id,
              perm_flag: perm_flag ? 'rw' : 'ro',
            }))
          : undefined,
      };

      if (action === ActionType.CreateBusiness) {
        createBusinessTeam(params).then((_) => {
          message.success(t('业务组创建成功'));
          onClose(true);

          if (val === 'search') {
            onSearch(params.name);
          }
        });
      }

      if (action === ActionType.EditBusiness && teamId) {
        changeBusinessTeam(teamId, params).then((_) => {
          message.success(t('业务组信息修改成功'));
          onClose(true);
        });
      }

      if (action === ActionType.AddBusinessMember && teamId) {
        const params = members.map(({ perm_flag, user_group_id }) => ({
          user_group_id,
          perm_flag: perm_flag ? 'rw' : 'ro',
          busi_group_id: teamId,
        }));
        addBusinessMember(teamId, params).then((_) => {
          message.success(t('业务组成员添加成功'));
          onClose();
        });
      }
    }
  };

  const actionLabel = () => {
    if (action === ActionType.CreateUser) {
      return t('创建用户');
    }
    if (action === ActionType.CreateTeam) {
      return t('创建团队');
    }
    if (action === ActionType.CreateBusiness) {
      return t('创建业务组');
    }
    if (action === ActionType.AddBusinessMember) {
      return t('添加业务组成员');
    }
    if (action === ActionType.EditBusiness) {
      return t('编辑业务组');
    }
    if (action === ActionType.EditUser) {
      return t('编辑用户信息');
    }
    if (action === ActionType.EditTeam) {
      return t('编辑团队信息');
    }
    if (action === ActionType.Reset) {
      return t('重置密码');
    }
    if (action === ActionType.Disable) {
      return t('禁用');
    }
    if (action === ActionType.Undisable) {
      return t('启用');
    }
    if (action === ActionType.AddUser) {
      return t('添加成员');
    }
  };

  return (
    <Modal
      title={actionLabel()}
      visible={visible}
      width={width ? width : 700}
      onCancel={onClose}
      destroyOnClose={true}
      footer={[
        <Button key='back' onClick={onClose}>
          {t('取消')}
        </Button>,
        <Button key='submit' type='primary' onClick={() => onOk()}>
          {t('确定')}
        </Button>,
        action === ActionType.CreateTeam && (
          <Button type='primary' onClick={() => onOk('search')}>
            {t('确定并搜索')}
          </Button>
        ),
      ]}
    >
      {isUserForm && <UserForm ref={userRef} userId={userId} />}
      {isTeamForm && <TeamForm ref={teamRef} teamId={teamId} />}
      {isBusinessForm && <BusinessForm ref={teamRef} businessId={teamId} action={action} />}
      {isPasswordForm && <PasswordForm ref={passwordRef} userId={userId} />}
      {isAddUser && <AddUser teamId={teamId} onSelect={(val) => setSelectedUser(val)}></AddUser>}
    </Modal>
  );
};

export default CreateModal;
