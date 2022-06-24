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
import React, { createContext, useReducer } from 'react';

export const Context = createContext<any>({});

const reducer = (state, action) => {
  switch (action.type) {
    case 'updateMetric':
      return {
        ...state,
        metric: action.payload,
      };
    default:
      return state;
  }
};

const defaultData = {
  metric: {},
};

export function Reducer(props) {
  const [state, dispatch] = useReducer(reducer, defaultData);
  return <Context.Provider value={{ state, dispatch }}>{props.children}</Context.Provider>;
}
