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

const profileApi = 'api/n9e/self/profile';
// 修改个人信息
export const UpdateProfile = function (data: object) {
  return request(`/${profileApi}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const GetProfile = function () {
  return request(`/${profileApi}`, {
    method: RequestMethod.Get,
  });
};

const secretApi = 'api/n9e/self/token';
// 获取个人秘钥
export const GetSecret = function () {
  return request(`/${secretApi}`, {
    method: RequestMethod.Get,
  });
};

export const UpdateSecret = function (data: object) {
  return request(`/${secretApi}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const CreateSecret = function () {
  return request(`/${secretApi}`, {
    method: RequestMethod.Post,
  });
};
