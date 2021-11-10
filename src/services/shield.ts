import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9EAPI } from '../../config/constant';

export const getShieldList = function (data) {
  return request(`/api/n9e/mutes`, {
    method: RequestMethod.Get,
    params: data,
  });
};

export const addShield = function (data: {
  metric?: string;
  res_filters?: string;
  tags_filters?: string;
  cause: string;
  btime: number;
  etime: number;
}) {
  return request(`/api/n9e/mutes`, {
    method: RequestMethod.Post,
    data,
  });
};

export const viewShield = function (id: string) {
  return request(`/api/n9e/mute/${id}`, {
    method: RequestMethod.Get,
  });
};

export const deleteShields = function (id: number) {
  return request(`/api/n9e/mute/${id}`, {
    method: RequestMethod.Delete,
  });
};
