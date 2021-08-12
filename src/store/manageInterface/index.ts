import React from 'react';

export interface Contacts {
  key: string;
  value: string;
}
export interface User {
  id: string;
  username: string;
  nickname: string;
  phone: string;
  email: string;
  portrait: string;
  status: number;
  role: string;
  contacts: Contacts[];
  create_at: number;
  create_by: number;
  update_at: number;
  update_by: number;
}
export interface Team {
  id: string;
  name: string;
  note: string;
  create_at: number;
  create_by: string;
  update_at: number;
  update_by: string;
}
export interface UserList {
  list: Array<User>;
  total: number;
}
export interface TeamList {
  list: Array<Team>;
  total: number;
}
export enum UserType {
  User = '用户',
  Team = '团队',
}
export interface TeamInfo {
  user_group: Team;
  users: Array<User>;
}
export enum ActionType {
  CreateUser = '创建用户',
  CreateTeam = '创建团队',
  EditUser = '编辑用户信息',
  EditTeam = '编辑团队信息',
  Reset = '重置密码',
  Disable = '禁用',
  Undisable = '启用',
  AddUser = '添加成员',
}
export enum RoleType {
  Admin = '管理员',
  Standard = '普通用户',
  Guest = '游客',
}
export interface Title {
  create: string;
  edit: string;
  disabled: string;
  reset: string;
}
export type TitleKey = keyof Title;

export interface ModalProps {
  visible: boolean;
  userType?: string;
  onClose?: any;
  action: ActionType;
  userId?: string;
  teamId?: string;
  memberId?: string;
  onSearch?: any;
}
export interface TeamProps {
  onClose?: any;
  teamId?: string;
  onSelect?: any;
}
export interface UserAndPasswordFormProps {
  userId?: string;
}
export interface ContactsItem {
  key: string;
  label: string;
}
export interface PopoverProps {
  userId?: string;
  teamId?: string;
  memberId?: string;
  onClose: any;
  userType: string;
  isIcon?: boolean;
}
