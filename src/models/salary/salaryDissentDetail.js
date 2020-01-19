import { save, get } from '../../services/salary/salaryDissent';
import { message } from 'antd';

export default {
  namespace: 'salaryDissentDetail',

  state: {
    data: {},
  },

  effects: {
    *get({payload}, {call,put}) {
      const response = yield call(get,payload);
      yield put({
        type:"queryList",
        payload:{
          data:response.data
        }
      })
    },

    *save({payload}, {call}) {
      const response = yield call(save,payload);
      if(response.code===0) {
        message.success("操作成功！");
      }else {
        message.error("操作失败！"+response.msg);
      }
    }
  },

  reducers: {
    queryList(state, {payload}){
      return {
        ...state,
        data:payload.data
      }
    },
  }
};
