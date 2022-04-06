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
import { DependencyList, useCallback, useState, useRef } from 'react';
import useMountedState from '../use-mounted-state';

export type AsyncState<T> =
  | {
      loading: boolean;
      error?: undefined;
      value?: undefined;
    }
  | {
      loading: false;
      error: Error;
      value?: undefined;
    }
  | {
      loading: false;
      error?: undefined;
      value: T;
    };

export type AsyncFn<Result = any, Args extends any[] = any[]> = [
  AsyncState<Result>,
  (...args: Args | []) => Promise<Result>,
];

export default function useAsyncFn<Result = any, Args extends any[] = any[]>(
  fn: (...args: Args | []) => Promise<Result>,
  deps: DependencyList = [],
  initialState: AsyncState<Result> = { loading: false },
): AsyncFn<Result, Args> {
  const lastCallId = useRef(0);
  const [state, set] = useState<AsyncState<Result>>(initialState);

  const isMounted = useMountedState();

  const callback = useCallback((...args: Args | []) => {
    const callId = ++lastCallId.current;
    set({ loading: true });

    return fn(...args).then(
      (value) => {
        isMounted() &&
          callId === lastCallId.current &&
          set({ value, loading: false });

        return value;
      },
      (error) => {
        isMounted() &&
          callId === lastCallId.current &&
          set({ error, loading: false });

        return error;
      },
    );
  }, deps);

  return [state, callback];
}
