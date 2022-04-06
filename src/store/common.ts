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
import { CommonStoreState } from './commonInterface';
import { resourceStoreState } from './businessInterface';
import { eventStoreState } from './eventInterface';
import { warningStoreState } from './warningInterface';
import { IshieldState } from '@/store/warningInterface/shield';

export type RootState = {
  common: CommonStoreState;
  resource: resourceStoreState;
  strategy: warningStoreState;
  event: eventStoreState;
  shield: IshieldState;
};

export interface IContextPayload<T> {
  dispatch: any;
  data: T;
}

export interface IContext<T = any, R = any, C = any> {
  payload: IContextPayload<T>;
  ref?: React.MutableRefObject<R | undefined>;
  open: () => void;
  close: () => void;
  innerContext?: C;
  setInnerContext?: React.Dispatch<React.SetStateAction<C | undefined>>;
}

type disposer = (() => unknown) | null;
export interface IContextWrapperComponent<T, R, C> {
  renderContent: (context: IContext<T, R, C>) => React.ReactNode;
  renderTrigger: (context: IContext<T, R, C>) => React.ReactNode;
  onConfirm: (context: IContext<T, R, C>) => Promise<unknown>;
  onMounted?: (context: IContext<T, R, C>) => disposer;
  beforeClose?: (context: IContext<T, R, C>) => Promise<unknown>;
  renderFooter?: (context: IContext<T, R, C>) => React.ReactNode;
  payload: IContextPayload<T>;
}

export interface IStore<S, R = any, E = any> {
  namespace: string;
  state: S;
  reducers: R;
  effects: E;
}

export enum RequestMethod {
  Get = 'Get',
  Post = 'Post',
  Put = 'Put',
  Delete = 'Delete',
}

export type basePagingData<T = any> = {
  list: [T];
  total: number;
};

export type baseFePagingData<T = any> = [T];

export type basePagingReq<T = any> = {
  success: boolean;
  dat: baseFePagingData;
  err: string;
};

export type baseFePagingReq<T = any> = {
  success: boolean;
  dat: baseFePagingData;
  err: string;
};

export interface IBasePagingParams {
  limit: number;
  p: number;
}

export enum favoriteType {
  Add,
  Delete,
}

export enum favoriteFrom {
  Favorite,
  Common,
}

export type favoriteGroup = {
  favorite: Array<baseFavoriteItem>;
  common: Array<baseFavoriteItem>;
  commonTotal: number;
  currentPage: number;
};

export type baseFavoriteItem = {
  id: number;
  isFavorite: boolean;
  create_at: number;
  create_by: number;
  update_at: number;
  update_by: number;
  isBelongIn: favoriteFrom;
};
