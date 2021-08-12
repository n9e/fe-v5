/* eslint-disable */
const SHOW = '@@DVA_LOADING/SHOW';
const HIDE = '@@DVA_LOADING/HIDE';
const NAMESPACE = 'loading';

export default function createLoading() {
  let initalState = {
    effects: {}, //用来收集每个namespace下的effects是true还是false
  };
  const extraReducers = {
    //这里直接把写进combineReducer的reducer准备好，键名loading
    [NAMESPACE](state = initalState, { type, payload }) {
      let { actionType } = payload || {};
      switch (type) {
        case SHOW:
          return {
            effects: {
              ...state.effects,
              [actionType]: true,
            },
          };
        case HIDE:
          return {
            effects: {
              ...state.effects,
              [actionType]: false,
            },
          };
        default:
          return state;
      }
    },
  };
  function onEffect(effects, { put }, model, actionType) {
    //actiontype就是带前缀的saga名
    const { namespace } = model;
    return function* (...args) {
      try {
        //这里加上try，防止本身的effects执行挂了，然后就一直不会hide，导致整个功能失效。
        yield put({ type: SHOW, payload: { namespace, actionType } });
        return yield effects(...args);
      } finally {
        yield put({ type: HIDE, payload: { namespace, actionType } });
      }
    };
  }
  return {
    onEffect,
    extraReducers,
  };
}
