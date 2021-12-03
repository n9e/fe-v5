import { IStore } from '@/store/common';
import { IState } from '@/store/warningInterface/subscribe';

const initData: any = {
  curShieldData: {}
};

const SubscribeStore: IStore<IState> = {
  namespace: 'subscribe',
  state: initData,
  reducers: {
    saveData(state: IState, payload: any) {
      return { ...state, [payload.prop]: payload.data };
    },
  },
  effects: {
    *setCurShieldData({ data }, { put }) {
      // const { dat: data } = yield getCommonClusters();
      const tags = data.tags.map(item => {
        return {
          ...item,
          value: item.func === 'in' ? item.value.split(' ').join('\n') : item.value
        }
      })
      yield put({
        type: 'saveData',
        prop: 'curShieldData',
        data: {
          ...data,
          tags
        },
      });
    }
  },
};

export default SubscribeStore;
