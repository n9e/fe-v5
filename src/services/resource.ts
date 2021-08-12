import request from '@/utils/request';
import { RequestMethod, IBasePagingParams } from '@/store/common';
import { N9EAPI } from '../../config/constant';
import {
  collectItem,
  collect_type,
  prefixType,
} from '@/store/businessInterface';
import { PAGE_SIZE } from '@/utils/constant';

// 新建资源分组
export const addResourceGroup = function (params: {
  path: string;
  node: string;
}) {
  return request(`${N9EAPI}/api/n9e/classpaths`, {
    method: RequestMethod.Post,
    data: params,
  });
};

// 获取分组列表
export const getResourceGroups = function (query?: string, p = 1) {
  return request(`${N9EAPI}/api/n9e/classpaths`, {
    method: RequestMethod.Get,
    params: {
      query,
      limit: PAGE_SIZE,
      p,
    },
  });
};

// 获取收藏分组
export const getFavoritesResourceGroups = function () {
  return request(`${N9EAPI}/api/n9e/classpaths/favorites`, {
    method: RequestMethod.Get,
  });
};

// 添加收藏分组
export const addFavoriteGroup = function (id: number) {
  return request(`${N9EAPI}/api/n9e/classpath/${id}/favorites`, {
    method: RequestMethod.Post,
    data: {
      id,
    },
  });
};

// 删除收藏分组
export const deleteFavoriteGroup = function (id: number) {
  return request(`${N9EAPI}/api/n9e/classpath/${id}/favorites`, {
    method: RequestMethod.Delete,
    data: {
      id,
    },
  });
};

// 删除分组
export const deleteResourceGroup = function (id: number) {
  return request(`${N9EAPI}/api/n9e/classpath/${id}`, {
    method: RequestMethod.Delete,
  });
};

// 修改分组
export const updateResourceGroup = function (
  data: { path?: string; node?: string } & { id: number },
) {
  return request(`${N9EAPI}/api/n9e/classpath/${data.id}`, {
    method: RequestMethod.Put,
    data,
  });
};

//获取分组下资源列表
export const getResourceList = function (
  params: { id: number; prefix: prefixType } & IBasePagingParams,
) {
  return request(`${N9EAPI}/api/n9e/classpath/${params.id}/resources`, {
    method: RequestMethod.Get,
    params: {
      ...params,
      id: undefined,
    },
  });
};

//获取任意分组下所有资源列表
export const getResourceListAll = function (query?: string) {
  return request(`${N9EAPI}/api/n9e/resources`, {
    method: RequestMethod.Get,
    params: { qres: query },
  });
};

//分组删除资源
export const deleteResourceItem = function (id: number, ident: string[]) {
  return request(`${N9EAPI}/api/n9e/classpath/${id}/resources`, {
    method: RequestMethod.Delete,
    data: ident,
  });
};

//彻底删除资源
export const deleteResource = function (id: number) {
  return request(`${N9EAPI}/api/n9e/resource/${id}`, {
    method: RequestMethod.Delete,
  });
};

// 批量修改资源分组
export const updateResourceToGroup = function (params: {
  res_idents: string[];
  classpath_ids: string[];
}) {
  return request(`${N9EAPI}/api/n9e/resources/classpaths`, {
    method: RequestMethod.Put,
    data: params,
  });
};

//分组添加资源
export const addGroupResource = function (params: {
  id: number;
  data: Array<string>;
}) {
  return request(`${N9EAPI}/api/n9e/classpath/${params.id}/resources`, {
    method: RequestMethod.Post,
    data: params.data,
  });
};

//分组删除资源
export const deleteGroupResource = function (id: number, data: Array<string>) {
  return request(`${N9EAPI}/api/n9e/classpath/${id}/resources`, {
    method: RequestMethod.Delete,
    data,
  });
};

//获取分组详情
export const getResourceDetail = function (id: number) {
  return request(`${N9EAPI}/api/n9e/resource/${id}`, {
    method: RequestMethod.Get,
  });
};

//更新备注
export const updateResourceDetailNote = function (data: {
  ids: number[];
  note: string;
}) {
  return request(`${N9EAPI}/api/n9e/resources/note`, {
    method: RequestMethod.Put,
    data,
  });
};

//更新tags
export const updateResourceDetailTags = function (data: {
  ids: number[];
  tags: string;
}) {
  return request(`${N9EAPI}/api/n9e/resources/tags`, {
    method: RequestMethod.Put,
    data,
  });
};

//修改机器屏蔽时间
export const updateResourceMute = function (data: {
  ids: Array<number>;
  btime: number;
  etime: number;
}) {
  return request(`${N9EAPI}/api/n9e/resources/mute`, {
    method: RequestMethod.Put,
    data,
  });
};

//创建采集配置
export const createCollectSetting = function (data: Partial<collectItem>) {
  return request(`${N9EAPI}/api/n9e/collect-rules`, {
    method: RequestMethod.Post,
    data,
  });
};

//克隆采集配置
export const cloneCollectSetting = function (data: Partial<collectItem>) {
  return request(`${N9EAPI}/api/n9e/v2/collect-rules`, {
    method: RequestMethod.Post,
    data,
  });
};

//修改采集配置
export const updateCollectSetting = function (data: Partial<collectItem>) {
  return request(`${N9EAPI}/api/n9e/collect-rule/${data.id}`, {
    method: RequestMethod.Put,
    data,
  });
};

//查询采集配置
export const getCollectSettings = function (type: collect_type) {
  return function (params: { id: number } & IBasePagingParams) {
    return request(`${N9EAPI}/api/n9e/classpath/${params.id}/collect-rules`, {
      method: RequestMethod.Get,
      params: {
        ...params,
        type,
      },
    });
  };
};

//删除采集配置
export const deleteCollectSetting = function (ids: Array<number>) {
  return request(`${N9EAPI}/api/n9e/collect-rules`, {
    method: RequestMethod.Delete,
    data: {
      ids,
    },
  });
};

//删除采集配置
export const regCheck = function (data: {
  tags_pattern?: Object;
  func?: string;
  re?: string;
  log?: string;
  time?: string;
}) {
  return request(`${N9EAPI}/api/n9e/log/check`, {
    method: RequestMethod.Post,
    data,
  });
};
