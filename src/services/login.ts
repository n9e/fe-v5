import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9EAPI } from '../../config/constant';

// 登录
export const Login = function (username: string, password: string) {
  return request(`${N9EAPI}/api/n9e/auth/login`, {
    method: RequestMethod.Post,
    data: { username, password },
  });
};

// 登录
export const UpdatePwd = function (oldpass: string, newpass: string) {
  return request(`${N9EAPI}/api/n9e/self/password`, {
    method: RequestMethod.Put,
    data: { oldpass, newpass },
  });
};

// 获取csrf token
export const GenCsrfToken = function () {
  return request(`${N9EAPI}/api/n9e/csrf`, {
    method: RequestMethod.Get,
  });
};

// 退出
export const Logout = function () {
  return request(`${N9EAPI}/api/n9e/auth/logout`, {
    method: RequestMethod.Get,
  });
};
