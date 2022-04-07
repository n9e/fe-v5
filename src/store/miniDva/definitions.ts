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
/* eslint-disable */
/**
 * 类型来自dva.d.ts，对部分内容进行了删减
 */
import { Reducer, ReducersMapObject, Store } from 'redux';

export interface ReducerEnhancer {
  (reducer: Reducer<any>): void;
}
export type objType = {
  [key: string]: any;
};

export type reducer = Reducer;
export interface Hooks {
  onEffect?: () => void;
  extraReducers?: ReducersMapObject;
}

export interface resRejType extends objType {
  __dva_resolve?: (arg?: any) => any;
  __dva_reject?: (arg?: any) => any;
}
export interface EffectsCommandMap {
  put: <A extends resRejType>(action: A) => any;
  call: Function;
  select: Function;
  take: Function;
  cancel: Function;
  [key: string]: any;
}

export type Effect = (action: resRejType, effects: EffectsCommandMap) => void;
export type EffectType = 'takeEvery' | 'takeLatest' | 'watcher' | 'throttle';
export type EffectWithType = [Effect, { type: EffectType }];
export type ReducersMapObjectWithEnhancer = [
  ReducersMapObject,
  ReducerEnhancer,
];

export interface EffectsMapObject {
  [key: string]: Effect | EffectWithType;
}

export type reducers = objType;
export type effects = EffectsMapObject;
export type store = Store;

export interface Model {
  namespace: string;
  state: any;
  reducers: reducers;
  effects?: EffectsMapObject;
}

export type DvaInstance = {
  /**
   * Register an object of hooks on the application.
   *
   * @param hooks
   */
  use: (hooks: Hooks) => void;

  /**
   * Register a model.
   *
   * @param model
   */
  model: (model: Model) => void;

  /**
   * Unregister a model.
   *
   * @param namespace
   */
  unmodel: (namespace: string) => void;

  start: () => any;

  store: Store | {};
};
