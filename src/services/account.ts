import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9EAPI } from '../../config/constant';

const profileApi = 'api/n9e/self/profile';
// 修改个人信息
export const UpdateProfile = function (data: object) {
  return request(`${N9EAPI}/${profileApi}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const GetProfile = function () {
  return request(`${N9EAPI}/${profileApi}`, {
    method: RequestMethod.Get,
  });
};

const secretApi = 'api/n9e/self/token';
// 获取个人秘钥
export const GetSecret = function () {
  return request(`${N9EAPI}/${secretApi}`, {
    method: RequestMethod.Get,
  });
};

export const UpdateSecret = function (data: object) {
  return request(`${N9EAPI}/${secretApi}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const CreateSecret = function () {
  return request(`${N9EAPI}/${secretApi}`, {
    method: RequestMethod.Post,
  });
};
