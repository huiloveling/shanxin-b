import { list } from '../../services/salary/salaryBatch';
import { paySalary } from "../../services/salary/salary";
import { message } from 'antd';

export default {
  namespace: 'salaryPay',

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
    *pay({payload},{put, call}){
      const response = yield call(paySalary, payload);
      if (response.code === 0) {
        message.success("发薪操作成功！");
      } else {
        message.error("发薪操作失败！");
      }
      return response;
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
