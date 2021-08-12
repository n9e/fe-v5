import { IStore } from '@/store/common';
import { eventStoreState } from '@/store/eventInterface';

const defaultData: eventStoreState = {
  currentEdit: null,
};

const eventStore: IStore<eventStoreState> = {
  namespace: 'event',
  state: defaultData,
  reducers: {
    saveData(state: eventStoreState, payload: any) {
      return { ...state, [payload.prop]: payload.data };
    },
  },
  effects: {
    *editItem({ data }, { put, select }) {
      const { currentEdit } = yield select((state) => state.event);
      if (data && data.id) {
        if (!currentEdit || currentEdit.id !== data.id) {
          yield put({
            type: 'saveData',
            prop: 'currentEdit',
            data,
          });
        }
      }
    },
  },
};

export default eventStore;
