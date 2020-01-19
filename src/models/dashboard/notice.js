import { list, detail } from '../../services/dashboard/notice';

export default {
  namespace: 'notice',

  state: {
    data: {},
    currentItem: null
  },

  effects: {
    *list({payload}, {call,put}) {
      const response = yield call(list,payload)
      yield put({
        type:"queryList",
        payload:{
          data:response.data,
        }
      })
    },
    *detail({payload},{call,put}) {
      const response = yield call(detail, payload);
      yield put({
        type: 'loadItem',
        payload: response.data
      });
    }
  },

  reducers: {
    queryList(state,{payload}) {
      return {
        ...state,
        data:payload.data
      };
    },
    loadItem(state,{payload}) {
      return {
        ...state,
        currentItem: payload,
      }
    }
  }
};
