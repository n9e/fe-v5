import { IStore } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getBusiGroups, getCommonClusters } from '@/services/common';

const initData: CommonStoreState = {
  clusters: [],
  selectedClusters: JSON.parse(
    localStorage.getItem('selectedClusters') || '[]',
  ),
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
      // 初始化选中所有集群
      if (!localStorage.getItem('selectedClusters')) {
        localStorage.setItem('selectedClusters', JSON.stringify(data));
        yield put({
          type: 'saveData',
          prop: 'selectedClusters',
          data,
        });
      }
    },
    *getBusiGroups({ query }, { put }) {
      const { dat } = yield getBusiGroups(query);
      yield put({
        type: 'saveData',
        prop: 'busiGroups',
        data: dat,
      });
    },
  },
};

export default commonStore;
