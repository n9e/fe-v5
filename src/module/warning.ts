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
import { warningStoreState } from '@/store/warningInterface';
import { favoriteFrom } from '@/store/common';
import {
  deleteFavoriteGroup,
  addFavoriteGroup,
  getFavoritesStrategyGroups,
  getStrategyGroupList,
  updateStrategyGroup,
  deleteStrategyGroup,
} from '@/services/warning';

const defaultData: warningStoreState = {
  group: {
    favorite: [],
    common: [],
    currentPage: 1,
    commonTotal: 0,
  },
  currentGroup: {
    id: 1
  },
};

const resourceStore: IStore<warningStoreState> = {
  namespace: 'strategy',
  state: defaultData,
  reducers: {
    saveData(state: warningStoreState, payload: any) {
      return { ...state, [payload.prop]: payload.data };
    },
    saveStrategyGroupData(state: warningStoreState, { data }) {
      return {
        ...state,
        group: {
          ...state.group,
          ...data,
        },
      };
    },
  },
  effects: {
    *chooseGroupItem({ data }, { put, select }) {
      const { currentGroup } = yield select((state) => state.strategy);
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
    *getGroup({ sign, data = '' }, { put, select, call }) {
      const { currentGroup } = yield select((state) => state.strategy);
      if (sign === 'init' || sign === 'refresh') {
        const [commonData, favoriteData] = yield Promise.all([
          getStrategyGroupList('', 1),
          getFavoritesStrategyGroups(),
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
            type: 'saveStrategyGroupData',
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
        } = yield select((state) => state.strategy);
        const { success, dat } = yield call(getStrategyGroupList, data);
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
            type: 'saveStrategyGroupData',
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
        } = yield select((state) => state.strategy);
        const { success, dat } = yield call(
          getStrategyGroupList,
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
            type: 'saveStrategyGroupData',
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
      const { success } = yield call(deleteStrategyGroup, id);
      if (success) {
        yield put({
          type: 'getGroup',
          sign: 'refresh',
        });
      }
    },
    *updateGroup({ id, data }, { call, put }) {
      const { success } = yield call(updateStrategyGroup, id, data);
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
