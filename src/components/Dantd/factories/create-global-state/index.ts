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
import { useState } from 'react';
import useEffectOnce from './useEffectOnce';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

export function createGlobalState<S = any>(initialState?: S) {
  const store: {
    state: S | undefined;
    setState: (state: S | ((preState: S) => S)) => void;
    setters: any[];
  } = {
    state: initialState,
    setState(state: S | ((preState: S) => S)) {
      if (Object.prototype.toString.call(state) === '[object Function]') {
        const stateFunc = state as Function;
        store.state = stateFunc(store.state);
      } else {
        store.state = state as S;
      }
      store.setters.forEach((setter) => setter(store.state));
    },
    setters: [],
  };

  return (): [S | undefined, (state: S | ((preState: S) => S)) => void] => {
    const [globalState, stateSetter] = useState<S | undefined>(store.state);

    useEffectOnce(() => () => {
      store.setters = store.setters.filter((setter) => setter !== stateSetter);
    });

    useIsomorphicLayoutEffect(() => {
      if (!store.setters.includes(stateSetter)) {
        store.setters.push(stateSetter);
      }
    });

    return [globalState, store.setState];
  };
}

export default createGlobalState;
