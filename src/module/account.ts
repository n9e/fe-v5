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
import { accountStoreState } from '@/store/accountInterface';
import { Login, GenCsrfToken, CasLogin } from '@/services/login';
import { GetProfile, UpdateProfile } from '@/services/account';

export const INCREMENT = 'INCREMENT';
export const REDUCE = 'REDUCE';

export const SET_PROFILE = 'SET_PROFILE';
export const SET_CSRF_TOKEN = 'SET_CSRF_TOKEN';

interface Action {
  type: string;
  count: number;
}

const initData = {
  num: 0,
  profile: {
    nickname: '',
    role: '',
    roles: [],
    username: '',
    email: '',
    phone: '',
    id: 0,
    portrait: '',
    contacts: {},
  },
  csrfToken: '',
};

const accountStore: IStore<accountStoreState> = {
  namespace: 'account',
  state: initData,
  reducers: {
    [SET_PROFILE](state: accountStoreState, payload: { profile: object }) {
      return { ...state, profile: payload.profile };
    },
  },
  effects: {
    *login(
      { username, password }: { username: string; password: string },
      { put, call, select }: any,
    ) {
      const { dat, err } = yield call(Login, username, password);
      yield put({ type: SET_PROFILE, profile: dat.user });
      const { access_token, refresh_token } = dat;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      yield put({
        type: 'common/getClusters',
      });
      yield put({
        type: 'common/getBusiGroups',
      });
      return err;
    },
    *getProfile({}, { put, call, select }: any) {
      const { dat, err } = yield call(GetProfile);
      yield put({ type: SET_PROFILE, profile: dat });
      return err;
    },
    *updateProfile({ data }: { data: object }, { put, call, select }: any) {
      const { dat, err } = yield call(UpdateProfile, data);
      yield put({ type: SET_PROFILE, profile: data });
      return err;
    },
    *casLogin(
      { ticket }: {ticket, string},
      { put, call }: any,
    ){
      const { dat, err } = yield call(CasLogin, ticket);
      yield put({ type: SET_PROFILE, profile: dat.user });
      const { access_token, refresh_token } = dat;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      yield put({
        type: 'common/getClusters',
      });
      yield put({
        type: 'common/getBusiGroups',
      });
      return err;
    },
  },
};

export default accountStore;
