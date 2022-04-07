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
import { eventStoreState } from '@/store/eventInterface';
import { getBusiGroupsCurAlerts } from '@/services/warning';

const defaultData: eventStoreState = {
  currentEdit: null,
  // 活跃告警状态
  alertings: {},
  severity: undefined,
  hourRange: { num: 6, unit: 'hours', description: 'hours' },
  queryContent: '',
  // 历史告警状态
  hisSeverity: undefined,
  hisEventType: undefined,
  hisHourRange: { num: 6, unit: 'hours', description: 'hours' },
  hisQueryContent: '',
};

const eventStore: IStore<eventStoreState> = {
  namespace: 'event',
  state: defaultData,
  reducers: {
    saveData(state: eventStoreState, payload: any) {
      return { ...state, [payload.prop]: payload.data };
    },
  },
  effects: {
    *editItem({ data }, { put, select }) {
      const { currentEdit } = yield select((state) => state.event);
      if (data && data.id) {
        if (!currentEdit || currentEdit.id !== data.id) {
          yield put({
            type: 'saveData',
            prop: 'currentEdit',
            data,
          });
        }
      }
    },
    *refreshAlertings({ ids }, { put, call }) {
      const { dat: data } = yield call(getBusiGroupsCurAlerts, ids);
      yield put({
        type: 'saveData',
        prop: 'alertings',
        data,
      });
    },
  },
};

export default eventStore;
