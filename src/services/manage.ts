import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9EAPI } from '../../config/constant';

// 修改个人信息
export const getUserInfoList = function (params = {}) {
  return request(`${N9EAPI}/api/n9e/users`, {
    method: RequestMethod.Get,
    params,
  });
};
export const getTeamInfoList = function (params = {}) {
  return request(`${N9EAPI}/api/n9e/user-groups`, {
    method: RequestMethod.Get,
    params,
  });
};
export const createUser = function (data: object) {
  return request(`${N9EAPI}/api/n9e/users`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const createTeam = function (data: object) {
  return request(`${N9EAPI}/api/n9e/user-groups`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const getUserInfo = function (id: string) {
  return request(`${N9EAPI}/api/n9e/user/${id}/profile`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
export const getTeamInfo = function (id: string) {
  return request(`${N9EAPI}/api/n9e/user-group/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
export const changeUserInfo = function (id: string, data: object) {
  return request(`${N9EAPI}/api/n9e/user/${id}/profile`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const changeStatus = function (id: string, data: object) {
  return request(`${N9EAPI}/api/n9e/user/${id}/status`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const changeTeamInfo = function (id: string, data: object) {
  return request(`${N9EAPI}/api/n9e/user-group/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const changeUserPassword = function (id: string, data: object) {
  return request(`${N9EAPI}/api/n9e/user/${id}/password`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const disabledUser = function (id: string, data: object) {
  return request(`${N9EAPI}/api/n9e/user/${id}/password`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const deleteUser = function (id: string) {
  return request(`${N9EAPI}/api/n9e/user/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};
export const deleteTeam = function (id: string) {
  return request(`${N9EAPI}/api/n9e/user-group/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};
export const deleteMember = function (id: string, data: object) {
  return request(`${N9EAPI}/api/n9e/user-group/${id}/members`, {
    method: RequestMethod.Delete,
    data,
  }).then((res) => res && res.dat);
};
export const addTeamUser = function (id: string, data: object) {
  return request(`${N9EAPI}/api/n9e/user-group/${id}/members`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const getNotifiesList = function () {
  return request(`${N9EAPI}/api/n9e/notify-channels`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const getContactsList = function () {
  return request(`${N9EAPI}/api/n9e/contact-channels`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
