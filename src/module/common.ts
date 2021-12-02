import { IStore } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { getBusiGroups, getCommonClusters } from '@/services/common';

const initData: CommonStoreState = {
  clusters: [],
  curClusterItems: JSON.parse(localStorage.getItem('curClusterItems') || '[]'),
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
      const { dat } = yield getCommonClusters();
      const data = dat || []
      yield put({
        type: 'saveData',
        prop: 'clusters',
        data,
      });
    },
    *getBusiGroups({ query }, { put, select }) {
      const { curBusiItem } = yield select((state) => state.common);
      const { dat } = yield getBusiGroups(query);
      const data = dat || []
      // 如果业务组列表中不存在当前选中的业务组，则清空
      if (curBusiItem.id && data.every((item) => item.id !== curBusiItem.id)) {
        yield put({
          type: 'saveData',
          prop: 'curBusiItem',
          data: {},
        });
        localStorage.setItem('curBusiItem', '{}');
      }

      yield put({
        type: 'saveData',
        prop: 'busiGroups',
        data,
      });
    },
  },
};

export default commonStore;
