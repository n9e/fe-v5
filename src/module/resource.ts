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
import { favoriteType, IStore } from '@/store/common';
import {
  resourceStoreState,
  prefixType,
} from '@/store/businessInterface/resource';
import { favoriteFrom } from '@/store/common';
import {
  getResourceGroups,
  getFavoritesResourceGroups,
  deleteResourceGroup,
  updateResourceGroup,
  deleteFavoriteGroup,
  addFavoriteGroup,
  getResourceDetail,
} from '@/services';

const defaultData: resourceStoreState = {
  tableData: [],
  pageNumber: 1,
  group: {
    favorite: [],
    common: [],
    currentPage: 1,
    commonTotal: 0,
  },
  currentGroup: null,
  prefix: prefixType.UnNeed,
  // 资源面板数据
  resourceData: {
    resourceDetail: null,
    resourceDetailLoading: false,
  },
};

const resourceStore: IStore<resourceStoreState> = {
  namespace: 'resource',
  state: defaultData,
  reducers: {
    saveData(state: resourceStoreState, payload: any) {
      return { ...state, [payload.prop]: payload.data };
    },
    saveResourceGroupData(state: resourceStoreState, { data }) {
      return {
        ...state,
        group: {
          ...state.group,
          ...data,
        },
      };
    },
    saveResourceData(state: resourceStoreState, { data }) {
      return {
        ...state,
        resourceData: {
          ...state.resourceData,
          ...data,
        },
      };
    },
  },
  effects: {
    *updatePrefix({ data }, { put }) {
      yield put({
        type: 'saveData',
        prop: 'prefix',
        data,
      });
    },
    *chooseGroupItem({ data }, { put, select }) {
      const { currentGroup } = yield select((state) => state.resource);
      if (data && data.id) {
        if (!currentGroup || currentGroup.id !== data.id) {
          yield put({
            type: 'saveData',
            prop: 'currentGroup',
            data,
          });
        }
      }
    },
    *getResourceItem({ id }, { call, put }) {
      yield put({
        type: 'saveResourceData',
        data: {
          resourceDetailLoading: true,
        },
      });
      const { success, dat } = yield call(getResourceDetail, id);
      if (success) {
        yield put({
          type: 'saveResourceData',
          data: {
            resourceDetail: dat,
          },
        });
      }
      yield put({
        type: 'saveResourceData',
        data: {
          resourceDetailLoading: false,
        },
      });
    },
    *getGroup({ sign, data = '' }, { put, select, call }) {
      const { currentGroup } = yield select((state) => state.resource);
      if (sign === 'init' || sign === 'refresh') {
        const [commonData, favoriteData] = yield Promise.all([
          getResourceGroups('', 1),
          getFavoritesResourceGroups(),
        ]);
        if (commonData.success) {
          const realFavoriteData =
            favoriteData?.dat?.map((item) => {
              return {
                ...item,
                isFavorite: true,
                isBelongIn: favoriteFrom.Favorite,
              };
            }) || [];
          const realCommonData =
            commonData?.dat?.list.map((item) => {
              return {
                ...item,
                isFavorite: !!realFavoriteData.find(
                  (favorItem) => favorItem.id === item.id,
                ),
                isBelongIn: favoriteFrom.Common,
              };
            }) || [];
          const total = commonData?.dat?.total || 0;
          yield put({
            type: 'saveResourceGroupData',
            data: {
              favorite: realFavoriteData,
              common: realCommonData,
              commonTotal: total,
              currentPage: 1,
            },
          });
          if (sign === 'init' && data && data !== '') {
            const targetGroup = realCommonData.find(
              (item) => item.id === Number(data),
            );
            yield put({
              type: 'saveData',
              prop: 'currentGroup',
              data: targetGroup,
            });
          } else {
            if (!currentGroup) {
              yield put({
                type: 'saveData',
                prop: 'currentGroup',
                data: realCommonData[0],
              });
            } else {
              // update current groupitem data
              const targetGroup = realCommonData.find(
                (item) => item.id === currentGroup.id,
              );
              if (targetGroup) {
                yield put({
                  type: 'saveData',
                  prop: 'currentGroup',
                  data: targetGroup,
                });
              } else {
                yield put({
                  type: 'saveData',
                  prop: 'currentGroup',
                  data: realCommonData[0],
                });
              }
            }
          }
        }
      } else if (sign === 'search') {
        const {
          group: { favorite },
        } = yield select((state) => state.resource);
        const { success, dat } = yield call(getResourceGroups, data);
        if (success) {
          const total = dat?.total || 0;
          const realCommonData =
            dat?.list.map((item) => {
              return {
                ...item,
                isFavorite: !!favorite.find(
                  (favorItem) => favorItem.id === item.id,
                ),
                isBelongIn: favoriteFrom.Common,
              };
            }) || [];
          yield put({
            type: 'saveResourceGroupData',
            data: {
              common: realCommonData,
              commonTotal: total,
              currentPage: 1,
            },
          });
          if (
            (!currentGroup && !currentGroup.id) ||
            !favorite.find((favorItem) => favorItem.id === currentGroup.id) ||
            !realCommonData.find(
              (commonItem) => commonItem.id === currentGroup.id,
            )
          ) {
            yield put({
              type: 'saveData',
              prop: 'currentGroup',
              data: realCommonData[0],
            });
          }
        }
      } else if (sign === 'append') {
        const {
          group: { common, favorite, currentPage },
        } = yield select((state) => state.resource);
        const { success, dat } = yield call(
          getResourceGroups,
          '',
          currentPage + 1,
        );
        // todo 优化重复逻辑, redux-saga 如何抽取公共函数?
        if (success) {
          const total = dat?.total || 0;
          const realCommonData =
            dat?.list.map((item) => {
              return {
                ...item,
                isFavorite: !!favorite.find(
                  (favorItem) => favorItem.id === item.id,
                ),
                isBelongIn: favoriteFrom.Common,
              };
            }) || [];
          yield put({
            type: 'saveResourceGroupData',
            data: {
              common: common.concat(realCommonData),
              commonTotal: total,
              currentPage: currentPage + 1,
            },
          });
          // if (
          //   (!currentGroup && !currentGroup.id) ||
          //   !favorite.find((favorItem) => favorItem.id === currentGroup.id) ||
          //   !realCommonData.find(
          //     (commonItem) => commonItem.id === currentGroup.id,
          //   )
          // ) {
          //   yield put({
          //     type: 'saveData',
          //     prop: 'currentGroup',
          //     data: realCommonData[0],
          //   });
          // }
        }
      }
    },
    *changeGroupFavorite({ id, favorType }, { put, call }) {
      const handler =
        favorType === favoriteType.Add ? addFavoriteGroup : deleteFavoriteGroup;
      const { success } = yield call(handler, id);
      if (success) {
        yield put({
          type: 'getGroup',
          sign: 'refresh',
        });
      }
    },
    *deleteGroup({ id }, { call, put }) {
      const { success } = yield call(deleteResourceGroup, id);
      if (success) {
        yield put({
          type: 'getGroup',
          sign: 'refresh',
        });
      }
    },
    *updateGroup({ id, data }, { call, put }) {
      const { success } = yield call(updateResourceGroup, { ...data, id });
      if (success) {
        yield put({
          type: 'getGroup',
          sign: 'refresh',
        });
      }
    },
  },
};

export default resourceStore;
