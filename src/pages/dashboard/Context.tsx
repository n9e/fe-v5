import React, { createContext, useReducer, useContext } from 'react';

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
