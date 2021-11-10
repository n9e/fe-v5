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
