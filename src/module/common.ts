import { IStore } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getBusiGroups, getCommonClusters } from '@/services/common';

const initData: CommonStoreState = {
  clusters: [],
  busiGroups: [],
  curBusiItem: JSON.parse(localStorage.getItem('curBusiItem') || '{}'),
};

const commonStore: IStore<CommonStoreState> = {
  namespace: 'common',
  state: initData,
  reducers: {
    saveData(state: CommonStoreState, payload: any) {
      return { ...state, [payload.prop]: payload.data };
    },
  },
  effects: {
    *getClusters({}, { put }) {
      const { dat: data } = yield getCommonClusters();
      yield put({
        type: 'saveData',
        prop: 'clusters',
        data,
      });
    },
    *getBusiGroups({ query }, { put }) {
      const { dat: data } = yield getBusiGroups(query);
      yield put({
        type: 'saveData',
        prop: 'busiGroups',
        data,
      });
      // 初始化选中第一项业务组
      if (!localStorage.getItem('curBusiItem') && data.length > 0) {
        localStorage.setItem('curBusiItem', JSON.stringify(data[0]))
        yield put({
          type: 'saveData',
          prop: 'curBusiItem',
          data: data[0],
        });
      }
    },
  },
};

export default commonStore;
