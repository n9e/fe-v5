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
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

// 登录
export const Login = function (username: string, password: string) {
  return request(`/api/n9e/auth/login`, {
    method: RequestMethod.Post,
    data: { username, password },
  });
};

// Cas登录
export const CasLogin = function (ticket: string) {
  return request(`/api/n9e/auth/cas-login`, {
    method: RequestMethod.Post,
    data: { ticket },
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

// 获取cas登录地址
export const getCasRedirectURL = function () {
  return request('/api/n9e/auth/cas-redirect', {
    method: RequestMethod.Get,
  });
};

export const authCallback = function (params) {
  return request('/api/n9e/auth/callback', {
    method: RequestMethod.Get,
    params,
  });
};

export const authCasCallback = function (params) {
  return request('/api/n9e/auth/cas-callback', {
    method: RequestMethod.Get,
    params,
  });
};