import { list } from '../../services/salary/salaryBatch';

export default {
  namespace: 'salaryHistory',

  state: {
    data: {
      list: [],
      pagination: {},
    },
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
  },

  reducers: {
    queryList(state, {payload}){
      return {
        ...state,
        ...payload
      }
    },
  }
};
