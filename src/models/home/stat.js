import {companyValidCount, empValidCount, salaryStatLastMonth, salaryStat} from '../../services/home/stat';

export default {
  namespace: 'stat',

  state: {
    companyValidCount: 0,
    empValidCount: 0,
    salaryStatLastMonthData: {
      avgMoney: 0,
      sumMoney: 0,
      maxMoney: 0
    },
    salaryStatData: {
      salarys: [],
      emps: [],
    }
  },

  effects: {
    *companyValid({payload}, {call, put}) {
      const response = yield call(companyValidCount, payload);
      yield put({
        type: 'loadCompanyValidData',
        payload: response.data,
      })
    },
    *empValid({payload}, {call, put}) {
      const response = yield call(empValidCount, payload);
      yield put({
        type: 'loadEmpValidData',
        payload: response.data,
      })
    },
    *salaryLastMonth({payload}, {call, put}) {
      const response = yield call(salaryStatLastMonth, payload);
      yield put({
        type: 'loadSalaryStatLastMonthData',
        payload: response.data,
      })
    },
    *salary({payload}, {call, put}) {
      const response = yield call(salaryStat, payload);
      yield put({
        type: 'loadSalaryStatData',
        payload: response.data,
      })
    },
  },

  reducers: {
    loadCompanyValidData(state, {payload}) {
      return {
        ...state,
        companyValidCount: payload.validCount,
      };
    },
    loadEmpValidData(state, {payload}) {
      return {
        ...state,
        empValidCount: payload.validCount,
      };
    },
    loadSalaryStatLastMonthData(state, {payload}) {
      return {
        ...state,
        salaryStatLastMonthData: payload,
      };
    },
    loadSalaryStatData(state, {payload}) {
      let data = {
        salarys: [],
        emps: [],
      };
      if (payload) {
        payload.forEach(item => {
          data.salarys.push({
            x: item.date,
            y: item.salarys
          });
          data.emps.push({
            x: item.date,
            y: item.emps
          });
        });
      }
      return {
        ...state,
        salaryStatData: data,
      };
    },
  }
};
