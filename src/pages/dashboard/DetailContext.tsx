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
/**
 * 大盘详情的 context
 */
import React, { createContext, useReducer } from 'react';
import { IVariable } from './VariableConfig';

type IMetric = {
  [index: string]: string;
};

interface IState {
  metric?: IMetric; // 当前选中的指标 meta TODO: 后面得改下名称
  dashboardId?: string;
  variableConfigWithOptions?: IVariable[];
}

interface IAction {
  type: string;
  payload: any;
}

export const DetailContext = createContext<any>({});

const reducer = (state: IState, action: IAction) => {
  switch (action.type) {
    case 'updateMetric':
      return {
        ...state,
        metric: action.payload as IMetric,
      };
    case 'initDashboard':
      const dashboardState = action.payload as IState;
      return {
        ...state,
        ...dashboardState,
      };
    default:
      return state;
  }
};

const defaultData: IState = {
  variableConfigWithOptions: [],
};

export function DetailReducer(props) {
  const [state, dispatch] = useReducer(reducer, defaultData);
  return <DetailContext.Provider value={{ state, dispatch }}>{props.children}</DetailContext.Provider>;
}
