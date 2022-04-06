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
import { IStore } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getBusiGroups, getCommonClusters } from '@/services/common';

const initData: CommonStoreState = {
  clusters: [],
  curClusterItems: JSON.parse(localStorage.getItem('curClusterItems') || '[]'),
  busiGroups: [],
  curBusiItem: JSON.parse(localStorage.getItem('curBusiItem') || '{}'),
};

const commonStore: IStore<CommonStoreState> = {
  namespace: 'common',
  state: initData,
  reducers: {
    saveData(state: CommonStoreState, payload: any) {
      return { ...state, [payload.prop]: payload.data };
    },
  },
  effects: {
    *getClusters({}, { put, select }) {
      const { curClusterItems } = yield select((state) => state.common);
      const { dat } = yield getCommonClusters();
      const data = dat || [];
      // 筛选去除当前选中集群列表中不存在的集群
      const filteredClusterItems = curClusterItems.filter((item: string) => data.includes(item));
      yield put({
        type: 'saveData',
        prop: 'curClusterItems',
        data: filteredClusterItems,
      });
      localStorage.setItem('curClusterItems', JSON.stringify(filteredClusterItems));

      if (!data.includes(localStorage.getItem('curCluster'))) {
        localStorage.removeItem('curCluster');
      }

      yield put({
        type: 'saveData',
        prop: 'clusters',
        data,
      });
    },
    *getBusiGroups({ query }, { put, select }) {
      const { curBusiItem } = yield select((state) => state.common);
      const { dat } = yield getBusiGroups(query);
      const data = dat || [];
      // 如果业务组列表中不存在当前选中的业务组，则清空
      if (curBusiItem.id && data.every((item) => item.id !== curBusiItem.id)) {
        yield put({
          type: 'saveData',
          prop: 'curBusiItem',
          data: {},
        });
        localStorage.removeItem('curBusiItem');
      }

      yield put({
        type: 'saveData',
        prop: 'busiGroups',
        data,
      });
    },
  },
};

export default commonStore;
