import { IStore } from '@/store/common';
import { IshieldState } from '@/store/warningInterface/shield';

// interface IshieldState {
//   curShieldData: shieldDetail
// }

const initData: any = {
  curShieldData: {}
};

const ShieldStore: IStore<IshieldState> = {
  namespace: 'shield',
  state: initData,
  reducers: {
    saveData(state: IshieldState, payload: any) {
      return { ...state, [payload.prop]: payload.data };
    },
  },
  effects: {
    *setCurShieldData({ data }, { put }) {
      // const { dat: data } = yield getCommonClusters();
      const tags = data.tags.map(item => {
        return {
          ...item,
          value: item.func === 'in' ? item.value.split(' ') : item.value
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

export default ShieldStore;
