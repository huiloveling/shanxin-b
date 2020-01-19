import { errorList, get, payroll } from '../../services/salary/salaryHistory';

export default {
  namespace: 'salaryHistoryDetail',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    salaryPayroll:{},
  },

  effects: {
    *list({payload}, {call,put}) {
      const response = yield call(get,payload)
      yield put({
        type:"queryList",
        payload:{
          data:response.data,
        }
      })
    },

    *errorList({payload}, {call,put}) {
      const response = yield call(errorList,payload)
      yield put({
        type:"queryList",
        payload:{
          data:response.data,
        }
      })
    },

    *salaryPayroll({payload}, {call,put}){
      const {data} = yield call(payroll,payload)
      yield put({
        type:"queryList",
        payload:{salaryPayrollData: data}
      })
      return data;
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
