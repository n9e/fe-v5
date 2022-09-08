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
import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

// 获取集群信息
export function getCommonClusters() {
  if (import.meta.env.VITE_IS_COMMON_DS === 'true') {
    let url = '/api/v1/datasource/list';
    if (import.meta.env.VITE_IS_DS_SETTING === 'true') {
      url = '/api/n9e-plus/datasource/list';
    }
    return request(url, {
      method: RequestMethod.Post,
      data: {
        category: 'timeseries',
        plugin_type: 'prometheus',
        p: 1,
        limit: 100,
      },
    }).then((res) => {
      return {
        dat: _.map(
          _.filter(res.data.items, (item) => {
            return item.plugin_type === 'prometheus';
          }),
          'name',
        ),
      };
    });
  }
  return request(`/api/n9e/clusters`, {
    method: RequestMethod.Get,
  });
}

// 获取es集群信息
export function getCommonESClusters() {
  if (import.meta.env.VITE_IS_COMMON_DS === 'true') {
    let url = '/api/v1/datasource/timeseries/elasticsearch/list';
    if (import.meta.env.VITE_IS_DS_SETTING === 'true') {
      url = '/api/n9e-plus/datasource/list';
    }
    return request(url, {
      method: RequestMethod.Post,
      data: {
        p: 1,
        limit: 100,
        category: 'logging',
      },
    }).then((res) => {
      return {
        dat: _.map(res.data.items, 'name'),
      };
    });
  }
  // TODO: n9e 暂时没有 es 集群接口
  return request(`/api/n9e/clusters`, {
    method: RequestMethod.Get,
  });
}

export function getBusiGroups(query: string, limit: number = 200) {
  return request(`/api/n9e/busi-groups`, {
    method: RequestMethod.Get,
    params: Object.assign(
      {
        limit,
      },
      query ? { query } : {},
    ),
  });
}

export function getPerm(busiGroup: string, perm: 'ro' | 'rw') {
  return request(`/api/n9e/busi-group/${busiGroup}/perm/${perm}`, {
    method: RequestMethod.Get,
  });
}

export function getMenuPerm() {
  return request(`/api/n9e/self/perms`, {
    method: RequestMethod.Get,
  });
}
