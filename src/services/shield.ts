import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9EAPI } from '../../config/constant';

export const getShieldList = function (params: { id: number },) {
  return request(`/api/n9e/busi-group/${params.id}/alert-mutes`, {
    method: RequestMethod.Get
  });
};

export const addShield = function (data: any, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-mutes`, {
    method: RequestMethod.Post,
    data,
  });
};

export const viewShield = function (id: string) {
  return request(`/api/n9e/mute/${id}`, {
    method: RequestMethod.Get,
  });
};

export const deleteShields = function (data: {ids: number[]}, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-mutes`, {
    method: RequestMethod.Delete,
    data
  });
};
