import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

// 获取监控对象列表
export function getMonObjectList(params) {
  return request(`/api/n9e/targets`, {
    method: RequestMethod.Get,
    params,
  });
}

export function bindTags(data) {
  return bindOrUnbindTags(true, data);
}

export function unbindTags(data) {
  return bindOrUnbindTags(false, data);
}

// 获取监控对象标签列表
export function getTargetTags(params) {
  return request(`/api/n9e/targets/tags`, {
    method: RequestMethod.Get,
    params,
  });
}

// 绑定/解绑标签
export function bindOrUnbindTags(isBind, data) {
  return request(`/api/n9e/targets/tags`, {
    method: isBind ? RequestMethod.Post : RequestMethod.Delete,
    data,
  });
}

// 修改/移出业务组
export function moveTargetBusi(data) {
  return request(`/api/n9e/targets/bgid`, {
    method: RequestMethod.Put,
    data: Object.assign({ bgid: 0 }, data),
  });
}

// 修改对象备注
export function updateTargetNote(data) {
  return request(`/api/n9e/targets/note`, {
    method: RequestMethod.Put,
    data,
  });
}

// 删除对象
export function deleteTargets(data) {
  return request(`/api/n9e/targets`, {
    method: RequestMethod.Delete,
    data,
  });
}
