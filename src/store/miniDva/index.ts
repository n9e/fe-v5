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
import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';
import loadingPlugin from './loadingPlugin';
import Plugin from './plugin';
import {
  Model,
  reducers,
  effects,
  store,
  reducer,
  Effect,
  objType,
  EffectWithType,
  resRejType,
} from './definitions';

function createPromiseMiddleware(app) {
  return () => (next) => (action) => {
    const { type } = action;
    if (isEffect(type)) {
      return new Promise((resolve, reject) => {
        next({
          __dva_resolve: resolve,
          __dva_reject: reject,
          ...action,
        });
      });
    } else {
      return next(action);
    }
  };

  function isEffect(type) {
    if (!type || typeof type !== 'string') return false;
    const [namespace] = type.split('/');
    const model = app._models.filter((m) => m.namespace === namespace)[0];
    if (model) {
      if (model.effects && model.effects[type]) {
        return true;
      }
    }

    return false;
  }
}

class MiniDva {
  private _models: Model[];
  store: store | objType;
  plugin: Plugin;

  constructor(plugin: Plugin) {
    this._models = [];
    this.store = {};
    this.plugin = plugin;
  }
  addModel(m: Model): void {
    const prefixmodel = this.prefixResolve(m);
    this._models.push(prefixmodel);
  }

  removeModel(): void {}
  private prefixResolve(model: Model): Model {
    if (model.reducers) {
      model.reducers = this.prefix(model.reducers, model.namespace);
    }
    if (model.effects) {
      model.effects = this.prefix(model.effects, model.namespace);
    }
    return model;
  }

  private prefix(obj: reducers | effects, namespace: string): objType {
    return Object.keys(obj).reduce((prev, next) => {
      // prev?????????next??????????????????
      const newkey = namespace + '/' + next;
      prev[newkey] = obj[next];
      return prev;
    }, {});
  }

  private getReducer(): reducer {
    let reducers: reducers = {};
    for (let m of this._models) {
      // m?????????model?????????
      reducers[m.namespace] = function (state = m.state, action) {
        // ?????????????????????reducer
        let everyreducers = m.reducers; // reducers?????????????????????????????????
        let reducer = everyreducers[action.type]; // ?????????????????????switch
        if (reducer) {
          return reducer(state, action);
        }
        return state;
      };
    }
    let extraReducers = this.plugin.get('extraReducers');
    return combineReducers({ ...reducers, ...extraReducers }); //reducer??????{reducer1:fn,reducer2:fn}
  }

  private getSagas(): (() => Generator)[] {
    let sagas: (() => Generator)[] = [];
    const that = this;
    for (let m of this._models) {
      sagas.push(function* () {
        for (const key in m.effects) {
          //key?????????????????????
          const watcher = that.getWatcher(
            key,
            m.effects[key],
            m,
            that.plugin.get('onEffect'),
          );
          yield sagaEffects.fork(watcher); //???fork????????????
        }
      });
    }
    return sagas;
  }

  private prefixType(type: string, model: Model) {
    if (type.indexOf('/') === -1) {
      //??????????????????????????????????????????????????????
      return model.namespace + '/' + type;
    }
    return type; // ??????????????????????????????????????????????????????model??????
  }
  private noop = (arg) => {};
  private getWatcher(
    key: string,
    effect: Effect | EffectWithType,
    model: Model,
    onEffect,
  ) {
    const that = this;
    const put = (action) => {
      return sagaEffects.put({
        ...action,
        type: this.prefixType(action.type, model),
      });
    };
    return function* () {
      yield sagaEffects.takeEvery(key, function* (action: resRejType) {
        if (onEffect) {
          for (const fn of onEffect) {
            // oneffect?????????
            effect = fn(effect, { ...sagaEffects, put }, model, key);
          }
        }
        const { __dva_resolve = that.noop } = action || {};
        // ???action????????????,??????????????????saga
        try {
          const ret = yield (effect as Effect)(action, { ...sagaEffects, put });
          __dva_resolve(ret);
        } catch (error) {
          console.error(error);
        }
      });
    };
  }

  start(): void {
    let reducer = this.getReducer();
    let sagas = this.getSagas();
    let sagaMiddleware = createSagaMiddleware();
    this.store = applyMiddleware(
      createPromiseMiddleware(this),
      sagaMiddleware,
    )(createStore)(reducer);
    sagas.forEach(sagaMiddleware.run);
  }
}
const plugin = new Plugin(['onEffect', 'extraReducers']);
const miniDva = new MiniDva(plugin);
miniDva.plugin.use(loadingPlugin());

export default miniDva;
