import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

// 登录
export const Login = function (username: string, password: string) {
  return request(`/api/n9e/auth/login`, {
    method: RequestMethod.Post,
    data: { username, password },
  });
};

// 刷新accessToken
export const UpdateAccessToken = function () {
  return request(`/api/n9e/auth/refresh`, {
    method: RequestMethod.Post,
    data: {
      refresh_token: localStorage.getItem('refresh_token'),
    },
  });
};

// 更改密码
export const UpdatePwd = function (oldpass: string, newpass: string) {
  return request(`/api/n9e/self/password`, {
    method: RequestMethod.Put,
    data: { oldpass, newpass },
  });
};

// 获取csrf token
export const GenCsrfToken = function () {
  return request(`/api/n9e/csrf`, {
    method: RequestMethod.Get,
  });
};

// 退出
export const Logout = function () {
  return request(`/api/n9e/auth/logout`, {
    method: RequestMethod.Post,
  });
};

export const getRedirectURL = function () {
  return request('/api/n9e/auth/redirect', {
    method: RequestMethod.Get,
  });
};

export const authCallback = function (params) {
  return request('/api/n9e/auth/callback', {
    method: RequestMethod.Get,
    params,
  });
};
