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
import { DependencyList, EffectCallback } from 'react';
import isDeepEqualReact from 'react-fast-compare';
import useCustomCompareEffect from './useCustomCompareEffect';

const isDeepEqual: (a: any, b: any) => boolean = isDeepEqualReact;
const isPrimitive = (val: any) => val !== Object(val);

const useDeepCompareEffect = (effect: EffectCallback, deps: DependencyList) => {
  if (process.env.NODE_ENV !== 'production') {
    if (!(deps instanceof Array) || !deps.length) {
      console.warn(
        '`useDeepCompareEffect` should not be used with no dependencies. Use React.useEffect instead.',
      );
    }

    if (deps.every(isPrimitive)) {
      console.warn(
        '`useDeepCompareEffect` should not be used with dependencies that are all primitive values. Use React.useEffect instead.',
      );
    }
  }

  useCustomCompareEffect(effect, deps, isDeepEqual);
};

export default useDeepCompareEffect;
