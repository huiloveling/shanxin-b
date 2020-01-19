import { list } from '../../services/settings/emp';

export default {
  namespace: 'emp',

  state: {
    data: {},
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
        data: payload.data
      }
    },
  }
};
