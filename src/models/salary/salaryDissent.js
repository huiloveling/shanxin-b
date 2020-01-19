import { list } from '../../services/salary/salaryDissent';

export default {
  namespace: 'salaryDissent',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *list({payload}, {call,put,select}) {
      const response = yield call(list,payload);
      yield put({
        type:"queryList",
        payload:{
          data:response.data,
        }
      })
    }
  },

  reducers: {
    queryList(state, {payload}){
      return {
        ...state,
        data:payload.data,
      }
    },
  }
};
