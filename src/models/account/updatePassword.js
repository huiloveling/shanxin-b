import { update } from '../../services/account/updatePassword';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
import stores from 'store2';

export default {
  namespace: 'updatePassword',

  state: {},

  effects: {
    *submit({payload}, { call, put }) {
      const response = yield call(update,payload);
      if (response.code === 0) {
        message.success("请使用新密码重新登录!")
        stores.clearAll();
        yield put(routerRedux.push('/account/login'));  //执行跳转操作
      }else{
        message.error(response.msg,5,()=>{})
      }
    },
},

  reducers: {

  }
};
